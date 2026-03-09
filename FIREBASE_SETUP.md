# Firebase Configuration Setup

## Backend Configuration

The backend uses Firebase Admin SDK with the service account credentials. Update your `backend/.env` file with:

```env
FIREBASE_PROJECT_ID=rememory-62207
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@rememory-62207.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCd3ttzcLV5j/zm\nMVYlDhIIGpvwZ+LvNDRGGyBjpW7qyILJr+5DS2UlJcaQLKLfRPDT/YFJct/Kiq8A\nPy5lwY4GKppKp+ZnGZJ01uoCAidQGFSiM/1a/iu7rYB+igSd3BLqubmsTqEBEoQ7\nq1BjSXa7XBGOoe1YUkT8PHH2n5g4auRg36MKCLlOfdFFdjZM8CHh+UrjyA7VCXPh\nZ6GFYCgsUF2Ch25z45k5r7uJ/xrw3iE4g+HTz5m64idOXbgGjZ2h7ifo2Rs1SJ9m\nR/oLZciw7jo2JgD0yELKKyRt2VCBr7npxMoU4Z+zkOJLWJlqMK0VWk38Lxqtut5D\ntD7AEaBjAgMBAAECggEADoRgRLjQD0ok1Nwjkku9b75WqaA794gi6HF1JIShcviW\nQkqpy8lilyxmmnpoTcSuqqfMnD7yglMHbavhrdzDHSEMyCGxZ7irxY+/vAiLqeta\n2QGT4iquRddaEgjKDOQgXzJN9yDR4GHeBAioX0DxqJ/6Q1Xzl+QU0OcUCbw6SLGy\ngU6VNFDqqIx9Fq+cV7OxJGYSqMVUiDF3CpDiy44AdhfB2rde7JO35pHfW2cM0aMM\n81gtDEXQ5S9YXiLYMnCcbCrhUR+hmkd9XZXsI3PVWmN3p+q8wsvqWDhW59UwLe8b\nMLS732nxx6hHlH8OkzbGTuf90M1CNTwGUnjxx9ujEQKBgQDdpsRqeF5K5gmOuEVZ\nh2aAkt2MRA+kq48mW4CQwECsVPIEsRECRBEo+L9ohPfSu5SO2rSXUQ19AA6q8Hcf\n1MqQjhBgb3dC16iZejV5NDDrNhnkQ4ds9DZ+0AvY/BDarctRFifBaGEyOGmbb9+x\nUwevy91Bs3p0uagq+yH8N/GpUQKBgQC2Vc8/KFVz+WhcKLK9qedNlDZws+X7Wrt6\nGn9Warx243HN+f/QrFfjKyKqQorEPTGsboqFpM+dCagyifwo4x6/elAcur0JwF0c\nyz625orqK+6mTUDG3pQja/VR77q9L/QUN2DxpNeLQSq//u+9HITUAs/Uif4oaCiN\nqxyEuPVBcwKBgD3QdXSP7xQKRV4VC9olBbQTwU+N56Lv6XM0D43O3/pvkjM2wlyU\naQi5HoBinM6bW5nfan/MretPacfIWiB5cqiPxgdu7p6okC+FQoZzxLTEGMJtBsae\n8Ne646L24ShrUYlimWG532lnDCS6NXM5iapAO4tIJ32IDVs3QEobu/yRAoGBALUf\nRlC5szESJn2tm+hVt0PUH8QSoDjwZ10ipy1jt7TtuGXgmiJioKczeSriENBg7VAZ\nOpcJIYcgSalycj73ZdrVGHGBejkOkjABIVo0Zve5Dka6ZMdn4IXTPwzWc4xs7yuJ\n204O7mIRKPMxvln/0157MJIzRXpEBUy9FgYtaMtLAoGAWWrddJh0ZJ3HE/t+Cgjk\nAIFYMXk3+bzuaiDxfier6aNQNzXXYj76SQ8+poN9eCYPiqPmQiqW0bi96CipmQS0\nHjs0sufNdiuUdOpAdEHOWY+12hgaobOwfoaxOWOd2Ya+W41t2VAPZ2KFvYqzoFwF\nDp3WJo/LTIzNiuGzwkEqBUw=\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://rememory-62207.firebaseio.com
```

## Frontend Configuration

Create a `frontend/.env` file with the following Firebase Web App configuration:

```env
VITE_FIREBASE_API_KEY=AIzaSyDUjjT84OkHj5tKy9D7C8l3l8VlbqWBowE
VITE_FIREBASE_AUTH_DOMAIN=rememory-62207.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=rememory-62207
VITE_FIREBASE_STORAGE_BUCKET=rememory-62207.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=941516430850
VITE_FIREBASE_APP_ID=1:941516430850:web:65a723d5bdf1725e3f511b
VITE_FIREBASE_MEASUREMENT_ID=G-LK040JQDB6

# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_STATIC_BEARER=
```

**Note:** The Firebase configuration has been updated in `frontend/src/services/firebase.ts` to include all required fields including `storageBucket` and `measurementId` for analytics.

## Enable Google Sign-In

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Google**
3. Enable it and set your support email
4. Save

## Important Security Notes

- Never commit `.env` files or the Firebase service account JSON file to git
- The `.gitignore` file has been updated to exclude these files
- Keep your private keys secure and never share them publicly
