import faiss
import pickle
import numpy as np
from collections import defaultdict
from connect import db_connection


def build_faiss_from_db():

    conn = db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            enrollment_no,
            face_embedding
        FROM student_face
        WHERE embedding_status='SUCCESS'
          AND face_embedding IS NOT NULL
    """)

    rows = cursor.fetchall()

    student_embeddings = defaultdict(list)

    for row in rows:

        embedding = np.frombuffer(
            row["face_embedding"],
            dtype=np.float32
        )

        student_embeddings[
            row["enrollment_no"]
        ].append(embedding)

    vectors = []
    mapping = {}

    for idx, (enrollment_no, embeddings) in enumerate(
        student_embeddings.items()
    ):

        avg_embedding = np.mean(
            embeddings,
            axis=0
        ).astype(np.float32)

        vectors.append(avg_embedding)

        mapping[idx] = enrollment_no

    if not vectors:
        return

    vectors = np.array(
        vectors,
        dtype=np.float32
    )

    faiss.normalize_L2(vectors)

    index = faiss.IndexFlatIP(
        vectors.shape[1]
    )

    index.add(vectors)

    faiss.write_index(
        index,
        "student.index"
    )

    with open(
        "faiss_mapping.pkl",
        "wb"
    ) as f:

        pickle.dump(
            mapping,
            f
        )

    cursor.close()
    conn.close()

    print(
        f"Saved {len(mapping)} students to FAISS"
    )