#!/bin/bash

# Define the path to your Docker Compose file directory
COMPOSE_DIR="."

# Define the path to your MongoDB data directory
MONGO_DIR="./mongodb"

# Define usage message
usage() {
    echo "Usage: $0 {start|stop|restart}"
    exit 1
}

# If no arguments supplied, display usage message
if [ "$#" -lt 1 ]; then
    usage
fi

cd "$COMPOSE_DIR" || exit

case "$1" in
start)
    docker-compose up -d
    echo "Docker Compose started in detached mode."
    ;;
stop)
    docker-compose down
    echo "Docker Compose services stopped."
    ;;
restart)
    docker-compose down
    echo "Docker Compose services stopped."

    rm -rf "$MONGO_DIR"
    echo "MongoDB data folder removed."

    docker-compose up -d --build
    echo "Docker Compose restarted in detached mode."
    ;;
*)
    usage
    ;;
esac
