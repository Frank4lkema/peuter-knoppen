# Knoppen

Speelgoed-website voor een peuter: er verschijnen knoppen met gezichtjes, indrukken geeft een geluidje en dan zijn ze weg. Elke 15 knoppen (`PARTY_EVERY` in `app.js`) is er een klein feestje en veranderen de figuren in een andere wereld: vormen, beestjes, vissen, voertuigen, safaridieren, de boerderij, de lucht, de noordpool of getallen (die het getal hardop zeggen als de iPhone een Nederlandse stem heeft). De volgorde is willekeurig, maar elke wereld komt langs voordat er een terugkomt. Geen tekst, geen reclame, geen netwerk nodig na de eerste keer laden.

## Lokaal draaien

```sh
python3 -m http.server 8000
```

Open daarna http://localhost:8000.

## Op de iPhone of iPad zetten

Offline werken kan alleen via HTTPS, dus de map moet één keer online staan (bijvoorbeeld GitHub Pages).

1. Open de URL in Safari, kies Deel en dan "Zet op beginscherm".
2. Open de app één keer vanaf het beginscherm terwijl je online bent.
3. Controleer het thuis: zet de vliegtuigmodus aan en open de app opnieuw.

## Als iOS-app

De map `ios/` verpakt dezelfde webcode als echte app, zodat hij zonder internet werkt en het scherm aan blijft.

1. Sluit de iPhone aan en zet op de iPhone Ontwikkelaarsmodus aan (Instellingen > Privacy en beveiliging).
2. Open `ios/Knoppen.xcodeproj` in Xcode, kies de iPhone bovenaan en druk op Run.
3. De eerste keer: vertrouw de ontwikkelaar op de iPhone via Instellingen > Algemeen > VPN en apparaatbeheer.

Met een gratis Apple-account werkt de app 7 dagen; daarna opnieuw op Run drukken. Na wijzigingen in `project.yml`: `xcodegen generate` in de map `ios/`.

## Begeleide toegang

1. Zet het eenmalig aan: Instellingen > Toegankelijkheid > Begeleide toegang, stel een toegangscode in en zet Automatische vergrendeling op Nooit.
2. Open de app en druk drie keer op de zijknop (of thuisknop) en kies Start.
3. Stoppen: weer drie keer drukken en de code invoeren.

## Aanpassen

Verhoog `CACHE` in `sw.js` na elke wijziging, anders blijven apparaten de oude versie gebruiken. De iconen komen uit `tools/make_icons.py`.
