# Use an official Python runtime as a parent image
FROM python:3.11

RUN apt-get update && apt-get install ffmpeg libsm6 libxext6 cmake -y

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt

RUN pip list
RUN pip show drowsydriver_detector

# Expose port 80 for the Flask app to listen on
EXPOSE 8080

# Run app.py when the container launches
CMD ["python", "app.py"]
