from flask import Flask, render_template, request, send_file
import os
from PyPDF2 import PdfMerger, PdfReader
from werkzeug.utils import secure_filename

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
MERGED_PDF_PATH = os.path.join(UPLOAD_FOLDER, 'merged.pdf')

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/merge', methods=['POST'])
def merge():
    files = request.files.getlist('pdfs')
    print("Received files:", [f.filename for f in files])

    if not files:
        return "No files uploaded", 400

    merger = PdfMerger()
    valid = 0

    for file in files:
        if file.filename.endswith('.pdf'):
            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            try:
                reader = PdfReader(filepath)
                if len(reader.pages) > 0:
                    merger.append(reader)
                    valid += 1
            except Exception as e:
                print(f"Skipping {filename} due to error: {e}")

    if valid == 0:
        return "No valid PDFs to merge", 400

    merger.write(MERGED_PDF_PATH)
    merger.close()

    # Clean uploaded files
    for file in os.listdir(UPLOAD_FOLDER):
        if file != 'merged.pdf':
            os.remove(os.path.join(UPLOAD_FOLDER, file))

    return send_file(MERGED_PDF_PATH, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
