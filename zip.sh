mv node_modules ..
mv .git ..
rm -rf ../relay.zip
zip -r ../relay.zip . 
mv ../node_modules .
mv ../.git .
