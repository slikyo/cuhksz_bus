FROM python:3.7.9-stretch
#RUN sed -i "s/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g" /etc/apk/repositories
#RUN apk update
#RUN apk add --no-cache --virtual .build-deps gcc python3-dev musl-dev alpine-sdk
#Make dir if doesn't exist
WORKDIR /city-sensing
ADD . /city-sensing
RUN mv /etc/apt/sources.list /etc/apt/sources.list.bak && \
    echo "deb http://mirrors.163.com/debian/ stretch main non-free contrib" >/etc/apt/sources.list && \
    echo "deb http://mirrors.163.com/debian/ stretch-proposed-updates main non-free contrib" >>/etc/apt/sources.list && \
    echo "deb-src http://mirrors.163.com/debian/ stretch main non-free contrib" >>/etc/apt/sources.list && \
    echo "deb-src http://mirrors.163.com/debian/ stretch-proposed-updates main non-free contrib" >>/etc/apt/sources.list

#COPY src src
#COPY gunicorn.conf.py gunicorn.conf.py
#COPY requirements.txt requirements.txt

#RUN pip install --no-cache-dir -r requirements.txt
#RUN pip install --upgrade pip -i https://pypi.tuna.tsinghua.edu.cn/simple
RUN pip install --no-cache-dir -r requirements.txt -i http://mirrors.aliyun.com/pypi/simple --trusted-host mirrors.aliyun.com
CMD ["gunicorn", "src.run:app", "-c", "./gunicorn.conf.py"]