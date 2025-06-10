FROM thyrlian/android-sdk

RUN apt update
RUN apt install curl -y
RUN curl -sL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup.sh
RUN bash /tmp/nodesource_setup.sh
RUN rm /tmp/nodesource_setup.sh
RUN apt install nodejs
RUN npm install -g yarn