from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
import psycopg2
import bcrypt
import uuid

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "super-secret-key"
CORS(app)
jwt = JWTManager(app)

# ───────────────────────────────────────────────
# DATABASE CONNECTION
# ───────────────────────────────────────────────
def get_db():
    return psycopg2.connect(
        host="postgres",
        database="dormfix",
        user="dormfix_user",
        password="dormfix_pass"
    )

# ───────────────────────────────────────────────
# ROOT
# ───────────────────────────────────────────────
@app.route("/")
def home():
    return jsonify({"message": "DormFix Backend Running"}), 200

# ───────────────────────────────────────────────
# SIGNUP
# ───────────────────────────────────────────────
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    role = data.get("role")

    if not email or not password or not name or not role:
        return jsonify({"error": "Missing fields"}), 400

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    try:
        conn = get_db()
        cur = conn.cursor()

        # Check duplicate
        cur.execute("SELECT id FROM users WHERE email=%s", (email,))
        if cur.fetchone():
            return jsonify({"error": "Email already exists"}), 400

        # Insert user
        cur.execute("""
            INSERT INTO users (
                email, password_hash, name, role,
                hostel, room_number, registration_number, department
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING id
        """, (
            email,
            hashed,
            name,
            role,
            data.get("hostel"),
            data.get("roomNumber"),
            data.get("registrationNumber"),
            data.get("department")
        ))

        user_id = cur.fetchone()[0]

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Account created", "user_id": user_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ───────────────────────────────────────────────
# LOGIN
# ───────────────────────────────────────────────
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute("""
            SELECT id, name, email, password_hash, role
            FROM users WHERE email=%s
        """, (email,))

        user = cur.fetchone()

        cur.close()
        conn.close()

        if not user:
            return jsonify({"error": "User not found"}), 404

        if not bcrypt.checkpw(password.encode("utf-8"), user[3].encode("utf-8")):
            return jsonify({"error": "Incorrect password"}), 401

        token = create_access_token(identity={
            "user_id": user[0],
            "role": user[4]
        })

        return jsonify({
            "token": token,
            "user": {
                "id": user[0],
                "name": user[1],
                "email": user[2],
                "role": user[4]
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ───────────────────────────────────────────────
# ADD COMPLAINT
# ───────────────────────────────────────────────
@app.route("/add-complaint", methods=["POST"])
def add_complaint():
    data = request.get_json()

    complaint_id = f"CN#{str(uuid.uuid4())[:6]}"

    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO complaints (
                id, category, urgency, status,
                description, room_number, hostel,
                student_name, student_email
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            complaint_id,
            data.get("category"),
            data.get("urgency"),
            "Pending",
            data.get("description"),
            data.get("roomNumber"),
            data.get("hostel"),
            data.get("studentName"),
            data.get("studentEmail")
        ))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Complaint added", "id": complaint_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ───────────────────────────────────────────────
# GET COMPLAINTS
# ───────────────────────────────────────────────
@app.route("/get-complaints", methods=["GET"])
def get_complaints():
    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute("SELECT * FROM complaints ORDER BY created_at DESC")
        rows = cur.fetchall()

        cur.close()
        conn.close()

        complaints = []
        for row in rows:
            complaints.append({
                "id": row[0],
                "category": row[1],
                "urgency": row[2],
                "status": row[3],
                "description": row[4],
                "roomNumber": row[5],
                "hostel": row[6],
                "studentName": row[7],
                "studentEmail": row[8],
                "technician": row[10],
                "created_at": row[18]
            })

        return jsonify(complaints), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ───────────────────────────────────────────────
# UPDATE COMPLAINT
# ───────────────────────────────────────────────
@app.route("/update-complaint/<id>", methods=["PUT"])
def update_complaint(id):
    data = request.get_json()

    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute("""
            UPDATE complaints
            SET status=%s, technician=%s, assigned_on=NOW()
            WHERE id=%s
        """, (
            data.get("status"),
            data.get("technician"),
            id
        ))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Updated"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ───────────────────────────────────────────────
# DELETE COMPLAINT
# ───────────────────────────────────────────────
@app.route("/delete-complaint/<id>", methods=["DELETE"])
def delete_complaint(id):
    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute("DELETE FROM complaints WHERE id=%s", (id,))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Deleted"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ───────────────────────────────────────────────
# RUN
# ───────────────────────────────────────────────
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)