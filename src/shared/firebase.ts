// import admin, { ServiceAccount } from 'firebase-admin';
// import { serviceAccount } from './serviceAccount';
// // import { serviceAccount } from './serviceAccount';

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount as ServiceAccount),
// });

// export default admin;


import admin from "firebase-admin";

const serviceAccount = {
  "type": "service_account",
  "project_id": "soog-484ab",
  "private_key_id": "187346f532ee8983ac673112f1bd5e1e69b74908",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCNIN7RCapgWZ1u\n6XpWoJ1vq9D26Niv39DxWCPP/n5dmiA+C80Xlen19vDkIxzJt9WnnqeUUvC2xM4I\neuv8Ws/3hoOAfvyz7DHCb6VBH7pZCLAnMO3lDScRh+yAnh/c2fyIoh60+z9YX00t\nSxUBI/OJ1ImxURw4lmdtRNOgTLecLRnhx+UZM76+ZADKWOPweeUmtZmrgb5Wehe1\np3G1cbTqCq4tNNsy2gFAskuRMbBvY11FkiLv5YK5FDorm0u38Qk5kzuldo3RN/Rk\nElipsWXOjuD06pQM/Cavg0heH1JPxFYPSF4jGPtMYHtBMN8QFYUTvipyZJVXwAWM\nx10NxDUjAgMBAAECggEAAOJMUv3fAdR93nR67jD6W3k1iV5jARMDUYeuTb631ulA\nu3LCeZvYR9CgqKUpqH/MyEx/mze7x0FLUxVGBiIhfFjs2PCyr4PSufeODu7ecXFS\n/SPa0Zz3+i2iRxn2dCEvakGttI+AUZLjPl3ih0vM2jepFyG9bgNPKYmNU8s3OTSy\nu6HySDjnhg3JcYt7lliy5dWlR2lje0vNP/uR4gfcIxt635eFpIPn3cTiV4pTvIJZ\n9eEYtiUfIPcDFXq5AM7f3sgYpHeGww/HMQpQsSq2H/9eksjjlE+k9hrLHpwC8dl4\nmhXODzxhrRVyuiSSnPmHRDO3hXRpuTb+pwVhPG2/rQKBgQDBZ0l50tmvuuXSFsPG\n1o5XahdL+cvCIM6wKMVFGH2wbv4Z2Srdp+mEFZrf9b9nVI9UnXgBx8UA01CD/6CZ\n6k9OrO8x2D/MBTZh6ExdwiKVB9uxqaPuL54lTYeQomPJ/JuYQvNNwkahrvAXvIqU\nKfBeWJ+859kn5IHHIioI/rNkdwKBgQC6zkKakMJc/k9pbXhYJAgWmkqqlEu5DeRw\nGo9QuI2jNwAeat3g1R8F8i9cYBifRI6EnXb+ZQjzWBzcN/Lo+ayH8CFvafOS+EJF\nlBc4CAv7rSJ1WzO2RCBocCr5RmiOVgSZ54SucWJ2oqmRnCkYWvzG3C6AxEV4SLNB\n1iuq3N97tQKBgGayYeG+hLk7lS2pyOucopjoTNabHgdHRHlmLNoz1woI5gTzvD9X\nGjh5AHRMGgbUcAeOVlsbqRB3JRnyc2VHdjVgvuLI4ZeEbQwwPdzLaXGZap88ZT/l\nKSTFtmam1DY9XKHNa0SvFLJmIjd4dl2Wp3xxsuCsfDMis4b6LTf5h2ihAoGBAIrZ\nz2XmHaJToSFDLkWNmrl6O++oxNQrQFYXV9lvJFBiDGOPmZaJs0KPLqbiAss3gRuP\nk6gp30pJf0ItEBAdrSFp2uBeh58Bivj+x3dte8K5gThr7vcWkmQuo7KfpA3QYCEp\nllS3kLGP3KyPv3gMAYGqnaI2wVBT8XIJSHH7NN5VAoGBAIY5IYH4TcJWWgfemoH8\nIC7TXV1GhAnzj3OxD3F6i3I0jHNfAHhdd2QXoPAk8/E+8MLezBBzl6bmb7omfL3d\nUn6eiSYYhzQ0zpsYnTV+RPCvkmCxPHbL6zGKO9gd5ExqGse7Xu3zOgKWQbgogEFt\nWx4z7fs4zUWiVRvqo52+dACc\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@soog-484ab.iam.gserviceaccount.com",
  "client_id": "107769627214492708878",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40soog-484ab.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

// {
//   "type": "service_account",
//   "project_id": "jonezthejewlerv2",
//   "private_key_id": "c5229811a50f54c2089513d5196c37ca8ba22bc7",
//   "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDEHP/6eyl9DERm\nSgotoDwHpKZKAO7JliohfeOkAzICqYwa2rFWTXlK2MXtNpT7k6ovvp86Uh73/nBc\ngpY/EKMdC380oSAQpz5wMQkWGAwx3+LdMYUuedduaorl7CALl3Lg8qBrwESiDgLk\nqFpz+nrGa/kB3wQdxPQdGnvwyWwVVE3yMtVZHhrOOSyFiLRZnLsmfbl+WnwUsGH1\n/0OCApFesjDX4jkX/uc9jIudG9SxWpDqS19BRjMf/6LJCReVpxWBx5hpwbVWWmnv\nYMwuxNVkB8+Qy6iH1ADqBfFp9o4Gfy4SWU/Orah4+LMBWaYPUcMoIjC9eNb5qthe\nenUJJtDtAgMBAAECggEADwhICMurBPZNQef3+sJXB6DzzCVhKFuV1CZhrh8+lJyp\nbB+KS1q56uZN2Z5+8f/CIlHCw8YqsIi01Sp/WMsuLZpFgGO/YPdo3lGr6CEkwifu\nrFTQ6ByXylNpXTFpzWmo+Rwv9sJwoFlhmGRdNpmjEpWRKzcMijmgGqD+khjma4X9\ntl4mCkxt82zuQZKNalO3K0QVDlJ7gXdEhpy+Phg8Wfox0RnltLywyHQamvWWQmRI\nzBfnHKtSN5VDo7N4OXVtO5TdsxT8w31/xvo1GPv49L722Yj4E+qb3bQlZsqbvfax\njPMrGSozk5F2y9MUl99WPAj86QmtKxgqJh6lc37LwQKBgQD7MvY7jc+HaBDyss96\n5cE2xQq7aAtGREwBFro30i1Ted75u7tWTbOXsoxRcw2vlFKbNBZDhMONVsfNYTKY\nrImegOxls/6Ikq3FgethcU/p2FnRLmnWARzaDDoNCFIvOw2bqr658JIyG0FfkNvg\n7Yt7GIUbZUw6j50wlCQI19fDYQKBgQDH3IVGbO3+MbMIcThsI5AE9HUXSr7soy0c\nt/co8klbpNeBpmwZnemx462KcwVX2Hys2DAaj4QA/BPeoZiVIg5E1RN+vuZ5DafW\nn/YWnrlWbJKFZ3ZAdC6JsDYwuTESC2b/MrIZ6ittGl6pXpxGKpGbvqBFbKFm5Fdv\nDo8CuQEFDQKBgDVeqnoUsxbtwUwPOY2+6sIcMx+GB38yW4OPtJjPitnFdt5QSIkZ\nkSKVyMI1U58OQE7BTkmiF3ocCe9Uy08suUB328Hv8BBMOadQ5xWY4YWpdcu/tLTH\nH74kAuFp9ywZu9Zq/IK83hLPP6ByQoUTcyMAHqenaf63LIp5rv5B/ZGBAoGAARUl\nt6rxYxYb1Sjf2F4c8pnsZHLoM9nybZxlf1hIo3FyJWakYUMkt+z2zLAw0DgA/OKy\n6AHtAiBbbzJK5Evp7d+FmoMoNnGnfhchux+i+1/dL1HPJyw58E7/DCaEqIddSHaa\n1l8ZWx7wclRr3kluvnw63AVpnmgQPS7EAYzE/6UCgYEAukpKEo3XwIFvYXQIjB48\n5FoR1GTkW12PtnPNmFt5NV2MkYOZg4zLu+8Agt0X1ZPWmQefP6GGZsjEl8DHDuUm\nBK5pohH1vMqLBprQqN5SchKpgfzJeizOLBmYYEZTJFuf+iJl717ka0cL6CeJdqxV\nySU/CPPxj+G5XDTbQo+uDpo=\n-----END PRIVATE KEY-----\n",
//   "client_email": "firebase-adminsdk-fbsvc@jonezthejewlerv2.iam.gserviceaccount.com",
//   "client_id": "108297644483952260394",
//   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//   "token_uri": "https://oauth2.googleapis.com/token",
//   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40jonezthejewlerv2.iam.gserviceaccount.com",
//   "universe_domain": "googleapis.com"
// }



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;
