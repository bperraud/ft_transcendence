# Use a base image with the necessary build tools
FROM gcc:latest

# Set the working directory inside the container
WORKDIR /app

# Copy the entire webserv directory into the container
COPY . /app

# Install any dependencies required for building

# Build the project using the Makefile

RUN make

RUN chmod -R 777 /app/webserv

# Set the command to run when the container starts
CMD ["./webserv", "configuration/conf.json"]
