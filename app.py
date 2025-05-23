
from flask import Flask, request, jsonify, render_template, redirect, url_for
import re
from flask_cors import CORS
from pdfminer.high_level import extract_text
import joblib

app = Flask(__name__)
CORS(app)

# Load your trained model
model = joblib.load('Logistic Regression_best_model.pkl')


def encode_education(education):
    education = education.lower()
    if 'phd' in education:
        return 3
    elif 'master' in education:
        return 2
    elif 'bachelor' in education:
        return 1
    else:
        return 0

def score_resume(resume):
    experience = resume.get('experience', 0)
    education = encode_education(resume.get('education', 'Unknown'))
    skills = resume.get('skills', [])
    skill_count = len(skills)

    features = [[experience, education, skill_count]]

    try:
        probas = model.predict_proba(features)
        score = float(probas[0][1])  # This will be between 0 and 1
    except Exception as e:
        print(f"Model error: {e}")
        score = 0.0

    return round(score, 2)

@app.route('/upload_resume', methods=['POST'])
def upload_resume():
    error = None
    result = None
    if request.method == "POST":
        file = request.files.get("pdf_file")
        if not file:
            return jsonify({'error': "No file uploaded."}), 400
        elif file.filename == "":
            return jsonify({'error': "No selected file."}), 400
        elif not file.filename.lower().endswith(".pdf"):
            return jsonify({'error': "File is not a PDF."}), 400
        else:
            try:
                file_bytes = file.read()
                reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
                full_text = ""
                for page in reader.pages:
                    full_text += page.extract_text() or ""

                if not is_resume(full_text):
                    return jsonify({'error': "Uploaded PDF is not recognized as a resume."}), 400

                # Extract simple info (simulate parseResumeText)
                name_match = re.search(r'([A-Z][a-z]+ [A-Z][a-z]+)', full_text)
                email_match = re.search(r'([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)', full_text)
                phone_match = re.search(r'(\+\d{1,2}\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}', full_text)

                common_skills = ['JavaScript', 'Python', 'Java', 'C++', 'HTML', 'CSS', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 'Docker', 'Machine Learning', 'Data Analysis', 'Project Management', 'Agile', 'Leadership']
                skills = [skill for skill in common_skills if skill.lower() in full_text.lower()]

                exp_match = re.search(r'(\d+)\+?\s*(years?|yrs?)', full_text) or re.search(r'experience:\s*(\d+)', full_text)
                experience = int(exp_match.group(1)) if exp_match else 1

                education_match = re.search(r'(Bachelor|Master|PhD|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?)', full_text)
                education = education_match.group(0) if education_match else 'Unknown'

                # Prepare response data
                resume_data = {
                    'id': str(hash(full_text))[:10],  # simple ID
                    'name': name_match.group(0) if name_match else "Unknown",
                    'email': email_match.group(0) if email_match else "",
                    'phone': phone_match.group(0) if phone_match else "",
                    'skills': skills,
                    'experience': experience,
                    'education': education,
                    'fileName': file.filename,
                    'textContent': full_text,
                    'score': 0
                }

                return jsonify({'result': "Resume uploaded and verified successfully!", 'resume': resume_data})
            except Exception as e:
                return jsonify({'error': f"Failed to parse PDF: {str(e)}"}), 500
# ------------------------
# Resume Parsing Function
# ------------------------
def parse_resume_text(text, file_name):
    def is_likely_resume(text):
        keywords = ['experience', 'education', 'skills', 'projects', 'summary']
        return sum(1 for k in keywords if k in text.lower()) >= 2

    if not is_likely_resume(text):
        return {'fileName': file_name, 'error': 'Not a valid resume format'}

    name_match = re.search(r"([A-Z][a-z]+ [A-Z][a-z]+)", text)
    name = name_match.group(0) if name_match else file_name.replace('.pdf', '')

    email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}", text)
    phone_match = re.search(r"(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})", text)

    common_skills = [
        'JavaScript', 'Python', 'Java', 'C++', 'HTML', 'CSS', 'React', 'Node.js',
        'SQL', 'Git', 'AWS', 'Docker', 'Machine Learning', 'Data Analysis',
        'Project Management', 'Agile', 'Leadership'
    ]
    skills = [skill for skill in common_skills if skill.lower() in text.lower()]

    exp_match = re.search(r"(\d+)\+?\s*(years?|yrs?)", text)
    experience = int(exp_match.group(1)) if exp_match else 0

    education_match = re.search(r"(PhD|Master|Bachelor|B\.?S\.?|M\.?S\.?)", text, re.IGNORECASE)
    education = education_match.group(0) if education_match else 'Unknown'

    return {
        'name': name,
        'email': email_match.group(0) if email_match else '',
        'phone': phone_match.group(0) if phone_match else '',
        'skills': skills,
        'experience': experience,
        'education': education,
        'fileName': file_name,
        'textContent': text,
    }

# ------------------------
# API: Upload and Score Resume
# ------------------------
@app.route('/process_resume', methods=['POST'])
def process_resume():
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file uploaded'}), 400

    file = request.files['resume']
    text = extract_text(file)

    resume_data = parse_resume_text(text, file.filename)
    resume_data['score'] = score_resume(resume_data)

    return jsonify(resume_data), 200


# ------------------------
# API: Bulk JSON Resume Scoring
# ------------------------
@app.route('/score', methods=['POST'])
def score_resumes():
    resumes = request.get_json()
    if not isinstance(resumes, list):
        return jsonify({'error': 'Input must be a list of resumes'}), 400

    scored_resumes = []
    for res in resumes:
        res['score'] = score_resume(res)
        scored_resumes.append(res)

    scored_resumes.sort(key=lambda x: x['score'], reverse=True)
    return jsonify(scored_resumes), 200

# ------------------------
# UI Routes
# ------------------------
@app.route('/')
def default():
    return redirect(url_for('signin'))

@app.route('/signin')
def signin():
    return render_template('signin.html')

@app.route('/home')
def home():
    return render_template('homepage.html')

@app.route('/index')
def index():
    return render_template('index.html')

# ------------------------
# Run App
# ------------------------
if __name__ == '__main__':
    app.run(debug=True)
