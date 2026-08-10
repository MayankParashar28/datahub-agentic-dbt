FROM python:3.9-slim

WORKDIR /code

# Install dependencies
COPY requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy source code and metadata into /code
COPY . /code

# Set PYTHONPATH so app.main imports cleanly
ENV PYTHONPATH=/code
ENV PORT=8000
ENV DEMO_MODE=true
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
