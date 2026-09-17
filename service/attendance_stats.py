"""
Attendance percentages are always measured against the lectures that were
actually conducted, never a fixed lecture count.

A conducted lecture is one distinct (date, time_slot) pair recorded for a
batch + class. Attendance rows are written only for students marked
present, so the denominator has to come from the sessions the class held
and not from a student's own row count. Taking attendance for a new slot
adds a session, which moves every percentage in that class by itself.
"""


def class_key(batch, class_name):
    return (
        str(batch or "").strip().lower(),
        str(class_name or "").strip().lower()
    )


def percentage(present, conducted):
    """Percent of conducted lectures attended, as a plain float.

    MySQL returns SUM()/COUNT() as Decimal, which jsonify would render as
    a quoted string, so every figure is cast before it leaves here.
    """

    conducted = int(conducted or 0)

    if not conducted:
        return 0.0

    return round(int(present or 0) * 100 / conducted, 2)


def conducted_sessions(cursor, batch, class_name, year=None, month=None):
    """Lectures conducted for one batch + class, optionally in one period."""

    query = """
        SELECT COUNT(DISTINCT date, time_slot) AS sessions
        FROM attendance
        WHERE batch = %s AND class = %s
    """

    params = [batch, class_name]

    if year:
        query += " AND YEAR(date) = %s"
        params.append(year)

    if month:
        query += " AND MONTH(date) = %s"
        params.append(month)

    cursor.execute(query, tuple(params))
    row = cursor.fetchone()

    return int(row["sessions"] or 0) if row else 0


def conducted_by_month(cursor, year):
    """{(batch, class): {month: conducted}} for every class in a year."""

    cursor.execute(
        """
        SELECT
            batch,
            class,
            MONTH(date) AS month,
            COUNT(DISTINCT date, time_slot) AS sessions
        FROM attendance
        WHERE YEAR(date) = %s
        GROUP BY batch, class, MONTH(date)
        """,
        (year,)
    )

    sessions = {}

    for row in cursor.fetchall():
        key = class_key(row["batch"], row["class"])
        sessions.setdefault(key, {})[row["month"]] = int(row["sessions"] or 0)

    return sessions


def present_by_month(cursor, year, class_name=None):
    """{enrollment_no: {month: present}} for one year."""

    query = """
        SELECT
            a.enrollment_no,
            MONTH(a.date) AS month,
            COUNT(*) AS present
        FROM attendance a
        WHERE YEAR(a.date) = %s AND a.status = 'present'
    """

    params = [year]

    if class_name:
        query += " AND a.class = %s"
        params.append(class_name)

    query += " GROUP BY a.enrollment_no, MONTH(a.date)"

    cursor.execute(query, tuple(params))

    present = {}

    for row in cursor.fetchall():
        present.setdefault(
            row["enrollment_no"], {}
        )[row["month"]] = int(row["present"] or 0)

    return present


MONTH_KEYS = [
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec"
]


def monthly_row(present_months, conducted_months):
    """Per-month percentages plus an average over the months that had class."""

    row = {}
    active = []

    for index, key in enumerate(MONTH_KEYS, start=1):

        conducted = conducted_months.get(index, 0)
        present = present_months.get(index, 0)

        # No lectures conducted means there is no percentage to show,
        # which the tables render as a dash rather than as 0%
        row[key] = percentage(present, conducted) if conducted else None
        row[key + "_conducted"] = conducted
        row[key + "_present"] = present

        if conducted:
            active.append(row[key])

    # Average only the months that actually had lectures, so a part-way
    # year isn't dragged down by months that have not happened yet
    row["avg_attendance"] = (
        round(sum(active) / len(active), 2) if active else 0.0
    )

    row["total_conducted"] = sum(conducted_months.values())
    row["total_present"] = sum(present_months.values())

    return row
