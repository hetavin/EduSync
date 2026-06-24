from connect import db_connection
import numpy as np
import cv2


def detections_to_embeddings(
    image,
    detections
):

    present_students = set()

    conn = db_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("""
            SELECT
                enrollment_no,
                face_embedding
            FROM student_face
            WHERE embedding_status='SUCCESS'
            AND face_embedding IS NOT NULL
        """)

        db_faces = cursor.fetchall()

        image = cv2.cvtColor(
            np.array(image),
            cv2.COLOR_RGB2BGR
        )

        for detection in detections:

            try:

                x1, y1, x2, y2 = detection["bbox"]

                face_img = image[
                    y1:y2,
                    x1:x2
                ]

                if face_img.size == 0:
                    continue

                img = cv2.resize(
                    face_img,
                    (112, 112)
                )

                query_embedding = (
                    recognition_model.get_feat(
                        img
                    )
                ).astype(np.float32)

                query_embedding = (
                    query_embedding /
                    np.linalg.norm(
                        query_embedding
                    )
                )

                best_score = 0
                best_student = None

                for row in db_faces:

                    db_embedding = np.frombuffer(
                        row["face_embedding"],
                        dtype=np.float32
                    )

                    db_embedding = (
                        db_embedding /
                        np.linalg.norm(
                            db_embedding
                        )
                    )

                    score = np.dot(
                        query_embedding,
                        db_embedding
                    )

                    if score > best_score:

                        best_score = score
                        best_student = (
                            row["enrollment_no"]
                        )

                if (
                    best_student and
                    best_score >= 0.45
                ):

                    present_students.add(
                        best_student
                    )

                    print(
                        f"Matched: "
                        f"{best_student} "
                        f"Score={best_score:.4f}"
                    )

            except Exception as e:

                print(
                    "Face Embedding Error:",
                    str(e)
                )

    except Exception as e:

        print(
            "Embedding Generation Error:",
            str(e)
        )

    finally:

        cursor.close()
        conn.close()

    print(
        "Present Students:",
        len(present_students)
    )

    return list(
        present_students
    )