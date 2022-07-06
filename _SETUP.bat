@echo off

call npm install @liamcottle/rustplus.js
PAUSE
call npx @liamcottle/rustplus.js fcm-register
PAUSE
IF EXIST "rustplus.config.json" (
    echo 'STEP 1: DONE'
) ELSE (
    echo 'STEP 1: ERROR, PLEASE EXIT AND RETRY'
)
PAUSE
node newUser.js
PAUSE
IF EXIST "user.json" (
    echo 'STEP 2: DONE'
) ELSE (
    echo 'STEP 2: ERROR, PLEASE EXIT AND RETRY'
)
PAUSE
git checkout main
PAUSE
echo 'ALL STEPS DONE'
PAUSE