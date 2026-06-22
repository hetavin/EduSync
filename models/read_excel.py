import re
import pandas as pd


def is_email(value):
    return bool(
        re.match(
            r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$',
            str(value).strip()
        )
    )


def is_phone(value):
    digits = re.sub(r'\D', '', str(value))
    return len(digits) == 10


def is_batch(value):
    value = str(value).strip()

    return bool(
        re.match(
            r'^\d{2,4}\s*-\s*\d{2,4}$',
            value
        )
    )


def is_enrollment(value):
    value = str(value).strip().upper()

    return bool(
        re.match(
            r'^\d+[A-Z]+\d+$',
            value
        )
    )


def is_class(value):
    value = str(value).strip().upper()

    if is_enrollment(value):
        return False

    return bool(
        re.match(
            r'^[A-Z]{1,4}-?[A-Z0-9]{1,5}$|^\d+[A-Z]+$',
            value
        )
    )


def is_name(value):
    value = str(value).strip()

    return (
        len(value.split()) >= 2
        and not is_email(value)
        and not is_phone(value)
        and not is_batch(value)
        and not is_enrollment(value)
    )


def get_batch_from_enrollment(enrollment):
    enrollment = str(enrollment).strip().upper()

    # D2D Students
    match = re.match(r'^(\d{3})S', enrollment)

    if match:
        start_year = 1799 + int(match.group(1))
        end_year = (start_year + 4) % 100
        return f"{start_year}-{end_year:02d}"

    # Regular Students
    match = re.match(r'^(\d{2})[A-Z]', enrollment)

    if match:
        start_year = 2000 + int(match.group(1))
        end_year = (start_year + 4) % 100
        return f"{start_year}-{end_year:02d}"

    return ""

def get_department_from_enrollment(enrollment):
    enrollment = str(enrollment).strip().upper()

    match = re.search(r'BE([A-Z]+)\d+', enrollment)

    if match:
        return match.group(1)

    return ""


def extract_student_data(row):

    student = {
        "enrollment_no": "",
        "name": "",
        "email": "",
        "phone_number": "",
        "batch": "",
        "class": "",
        "department": ""
    }

    for cell in row:

        if pd.isna(cell):
            continue

        value = str(cell).strip()

        if (
            not student["enrollment_no"]
            and is_enrollment(value)
        ):
            student["enrollment_no"] = value

        elif (
            not student["email"]
            and is_email(value)
        ):
            student["email"] = value

        elif (
            not student["phone_number"]
            and is_phone(value)
        ):
            student["phone_number"] = value

        elif (
            not student["batch"]
            and is_batch(value)
        ):
            student["batch"] = value

        elif (
            not student["class"]
            and is_class(value)
        ):
            student["class"] = value

        elif (
            not student["name"]
            and is_name(value)
        ):
            student["name"] = value

     # Generate batch from enrollment if not found
    if student["enrollment_no"]:

        if not student["batch"]:
            student["batch"] = get_batch_from_enrollment(
                student["enrollment_no"]
            )

        # Generate department from enrollment
        student["department"] = get_department_from_enrollment(
            student["enrollment_no"]
        )

    return student