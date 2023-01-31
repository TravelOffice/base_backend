# Base image that contain nodejs14x, aws cli ver2, terraform 1.1.5
FROM public.ecr.aws/q0p2c0k4/base_image

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
COPY infrastructures /infrastructures

ENTRYPOINT ["/entrypoint.sh"]
