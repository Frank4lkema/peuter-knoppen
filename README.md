# Knoppen

Speelgoed-website voor een peuter: er verschijnen knoppen met gezichtjes, indrukken geeft een geluidje en dan zijn ze weg. Elke 15 knoppen is er een klein feestje. Geen tekst, geen reclame, geen netwerk nodig na de eerste keer laden.

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

## Begeleide toegang

1. Zet het eenmalig aan: Instellingen > Toegankelijkheid > Begeleide toegang, stel een toegangscode in en zet Automatische vergrendeling op Nooit.
2. Open de app en druk drie keer op de zijknop (of thuisknop) en kies Start.
3. Stoppen: weer drie keer drukken en de code invoeren.

## Aanpassen

Verhoog `CACHE` in `sw.js` na elke wijziging, anders blijven apparaten de oude versie gebruiken. De iconen komen uit `tools/make_icons.py`.
