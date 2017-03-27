
#export NODE_ENV='production'
export NODE_ENV='development'
export FILE_UPLOAD='http://api.yuntianyuan.net'
pm2 start ./bin/www -n api 
