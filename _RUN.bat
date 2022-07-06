@echo off

mode con: cols=150 lines=40
git pull
node rustBot.js
PAUSE