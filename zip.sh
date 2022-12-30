mv node_modules ..
rm -rf ../relay.zip
zip -r ../relay.zip . -x node_modules/*
mv ../node_modules .
