@echo off
cd /d "C:\Sana Pathology apps"
"C:\Program Files\Git\bin\git.exe" add frontend backend mobile-app
"C:\Program Files\Git\bin\git.exe" commit -m "update"
"C:\Program Files\Git\bin\git.exe" push origin main
echo Done! Check GitHub Actions for frontend and Render for backend.
pause