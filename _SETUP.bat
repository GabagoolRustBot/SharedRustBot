@echo off

call npm install -g @liamcottle/rustplus.js
call npm link @liamcottle/rustplus.js
call npm install -g push-receiver
call npm link push-receiver
PAUSE
call npx @liamcottle/rustplus.js fcm-register
PAUSE
IF EXIST "rustplus.config.json" (
    echo 'STEP 1: DONE'
) ELSE (
    echo 'STEP 1: ERROR, PLEASE EXIT AND RETRY'
)
PAUSE
call node newUser.js
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