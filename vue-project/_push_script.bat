@echo off
echo === 1. Staging all changes ===
git add -A

echo === 2. Committing ===
git commit -m "feat: update all frontend code"

echo === 3. Clearing remote main branch ===
git checkout --orphan empty-main
git rm -rf .
git commit --allow-empty -m "clear main"
git push origin empty-main:main --force
git checkout master
git branch -D empty-main

echo === 4. Clearing remote master branch ===
git checkout --orphan empty-master
git rm -rf .
git commit --allow-empty -m "clear master"
git push origin empty-master:master --force
git checkout master
git branch -D empty-master

echo === 5. Pushing current code to master ===
git push origin master --force

echo === 6. Also pushing to main ===
git push origin master:main --force

echo === ALL DONE! ===
pause
