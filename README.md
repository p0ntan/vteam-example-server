# backend/REST-API

Denna strukturen kan hållas i varje repo som gör det smidigt att sätta ihop och starta tillsammans i systemet.

I rooten för varje repo ligger minst en README, ett bash-skript och en Dockerfile (förslagsvis också docker-compose.yml). Resten av filerna ligger sedan i en egen mapp, namnet är egentligen orelevant men förslagsvis src, app, root eller liknande. Det är sedan i den mappen man lägger själva applikationen och all kod, troligen det som tidigare varit rooten i andra repon man gjort. I det här repot ligger också databasen.

När man jobbar med sitt repo så bygger man det via docker och jobbar i containern med alla filer tillagda som volymer, då kan man vara säker på att alla kommer ha samma miljö när de sedan ska kopplas ihop. Imagen behöver alltså inte sparas och/eller laddas upp i utvecklingsfasen. Förslagsvis så använder man ett bash-skript som sköter detta åt en då kan man i huvudrepot sedan använda i stora drag samma uppsättning för att koppla ihop allt. Det blir även enklare för andra att bara köra skriptet för att köra repot lokalt.

I detta repo används också docker-compose för att enklare sätta upp repot.

```
# För att starta containern
./setup.bash up

# FÖr att stänga containern, och ta bort imagen som byggs
./setup.bash down
