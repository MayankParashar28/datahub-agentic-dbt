FROM python:3.9-slim

WORKDIR /code

# Install dependencies
COPY requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy source code and demo datasets
COPY . /code/app
COPY ../demo_datahub /code/demo_datahub

# Set environment variables for Hugging Face Spaces
ENV PORT=7860
ENV DEMO_MODE=true
ENV PYTHONUNBUFFERED=1

EXPOSE 7860

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
