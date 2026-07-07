import cv2
import numpy as np
from insightface.model_zoo import get_model
# from service.faiss_manager import build_faiss_from_db
from connect import db_connection

recognition_model = get_model(
    r"D:\Projects\EduSync\models\w600k_mbf.onnx"
)

recognition_model.prepare(
    ctx_id=0
)


def generate_embeddings(enrollment_no):

    conn = db_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("""
            SELECT
                id,
                face_image
            FROM student_face
            WHERE enrollment_no=%s
        """, (enrollment_no,))

        faces = cursor.fetchall()

        for row in faces:

            img_array = np.frombuffer(
                row["face_image"],
                np.uint8
            )

            img = cv2.imdecode(
                img_array,
                cv2.IMREAD_COLOR
            )

            img = cv2.resize(
                img,
                (112, 112)
            )

            embedding = recognition_model.get_feat(
                img
            )

            embedding_bytes = embedding.astype(
                np.float32
            ).tobytes()

            cursor.execute("""
                UPDATE student_face
                SET
                    face_embedding=%s,
                    embedding_status='SUCCESS'
                WHERE id=%s
            """, (
                embedding_bytes,
                row["id"]
            ))

        conn.commit()

    except Exception as e:

        print(
            "Embedding Error:",
            str(e)
        )

        cursor.execute("""
            DELETE FROM student_face
            WHERE enrollment_no=%s
        """, (
            enrollment_no,
        ))

        conn.commit()

    finally:

        cursor.close()
        conn.close()
        

def detections_to_embeddings(
    image,
    detections
):

    embeddings = []
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

                embedding = recognition_model.get_feat(
                    img
                )

                embedding_bytes = embedding.astype(
                    np.float32
                ).tobytes()

                embeddings.append({
                    "bbox": detection["bbox"],
                    "embedding": embedding,
                    "embedding_bytes": embedding_bytes
                })

                # MATCH WITH DATABASE

                query_embedding = embedding.astype(
                    np.float32
                )

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
                        f" Score={best_score:.4f}"
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
        "Embeddings Generated:",
        len(embeddings)
    )

    print(
        "Present Students:",
        len(present_students)
    )

    return {
        "embeddings": embeddings,
        "present_students": list(
            present_students
        )
    }