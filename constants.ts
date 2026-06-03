
export const MAX_CHARS_PER_REQUEST = 15000;
export const CHUNK_OVERLAP = 1000;

export const EXAMPLE_CONVERSATIONS = [
    {
        name: "Beispiel 1: Partner",
        conversation: `Ich: "Hey, ich hab heute die Beförderung bekommen! Ich bin so aufgeregt."
Partner: "Ah, das ist ja nett. Hast du daran gedacht, die Reinigung abzuholen? Ich hatte einen wirklich harten Tag, mein Chef hat mich total fertig gemacht. Niemand versteht, was ich durchmache."
Ich: "Oh, das tut mir leid. Aber... freust du dich gar nicht für mich?"
Partner: "Natürlich freue ich mich, aber mein Tag war einfach die Hölle. Du hattest es ja anscheinend leicht heute. Lass uns jetzt nicht über deine Arbeit reden, ich brauche Unterstützung."`,
        context: "Ein Gespräch mit meinem Partner über meine Beförderung."
    },
    {
        name: "Beispiel 2: Elternteil",
        conversation: `Ich: "Ich überlege, für ein paar Monate nach Spanien zu ziehen, um die Sprache zu lernen."
Mutter: "Spanien? Warum willst du so weit weg? Nach allem, was ich für dich getan habe, willst du mich einfach alleine lassen? Wer kümmert sich dann um mich, wenn ich krank bin? Das ist so undankbar von dir."
Ich: "Mama, es sind nur ein paar Monate. Und du bist doch gesund."
Mutter: "Man weiß nie. Deine Schwester würde so etwas nie tun, sie liebt ihre Familie. Du denkst immer nur an dich."`,
        context: "Ich erzähle meiner Mutter von meinen Reiseplänen."
    },
     {
        name: "Beispiel 3: Vorgesetzter",
        conversation: `Vorgesetzter: "Dieses Projekt ist eine Katastrophe. Die Präsentation war schwach und der Kunde ist unzufrieden."
Ich: "Ich habe genau die Anweisungen befolgt, die Sie mir gegeben haben. Wir hatten doch besprochen, den Fokus auf Aspekt X zu legen."
Vorgesetzter: "Hören Sie auf, Ausreden zu suchen. Ein guter Mitarbeiter hätte erkannt, dass das nicht der richtige Weg ist und proaktiv gehandelt. Ich habe Ihnen die Chance gegeben, sich zu beweisen, und Sie haben sie nicht genutzt. Jetzt muss ich das wieder ausbügeln."
Ich: "Aber die initialen Daten, die Sie mir gegeben haben, waren..."
Vorgesetzter: "Genug jetzt. Ich habe keine Zeit für Ihre Rechtfertigungen. Sorgen Sie einfach dafür, dass das bis morgen behoben ist."`,
        context: "Feedbackgespräch mit meinem Chef über ein Projekt."
    }
];

export const NARCISSISTIC_PATTERNS_DETAILS = [
    {
      "name": "Gaslighting",
      "simple": "Bringt dich dazu, an deiner eigenen Wahrnehmung und Vernunft zu zweifeln. 'Das bildest du dir nur ein.'",
      "scientific": "Eine Form der psychologischen Manipulation, bei der eine Person oder eine Gruppe heimlich Zweifel an einer Zielperson sät, sodass diese ihre eigene Erinnerung, Wahrnehmung oder ihren Verstand in Frage stellt. Dies führt oft zu Verwirrung, Vertrauensverlust in sich selbst und Abhängigkeit vom Manipulator."
    },
    {
      "name": "Projektion",
      "simple": "Schiebt die eigenen schlechten Eigenschaften oder Taten auf dich. 'Nicht ich bin wütend, DU bist wütend!'",
      "scientific": "Ein psychologischer Abwehrmechanismus, bei dem Individuen unerwünschte eigene Gedanken, Gefühle und Motive einer anderen Person zuschreiben. Statt die eigenen Mängel anzuerkennen, werden sie auf andere 'projiziert'."
    },
    {
      "name": "Love Bombing",
      "simple": "Überschüttet dich am Anfang mit übermäßiger Zuneigung und Aufmerksamkeit, um dich zu 'haken'.",
      "scientific": "Eine manipulative Taktik, die durch intensive und übermäßige Zurschaustellung von Zuneigung, Bewunderung und Aufmerksamkeit gekennzeichnet ist. Ziel ist es, das Ziel schnell an sich zu binden und ein Gefühl der Verpflichtung und Abhängigkeit zu erzeugen."
    },
    {
      "name": "Abwertung (Devaluation)",
      "simple": "Nach dem 'Love Bombing' fängt die Person an, dich klein zu machen, zu kritisieren und zu entwerten.",
      "scientific": "Die Phase, die oft auf Love Bombing folgt. Der Manipulator beginnt, das Ziel subtil oder offen zu kritiszivilisieren, abzuwerten und emotional zu missbrauchen. Dies untergräbt das Selbstwertgefühl des Ziels und festigt die Kontrolle des Manipulators."
    },
    {
      "name": "Schuldumkehr (Victim Playing)",
      "simple": "Stellt sich selbst als Opfer dar, um von eigenem Fehlverhalten abzulenken und bei dir Schuldgefühle zu erzeugen.",
      "scientific": "Eine manipulative Taktik, bei der eine Person die Rolle des Opfers einnimmt, um Verantwortung für ihre Handlungen zu vermeiden, Mitleid zu erregen oder andere zu manipulieren, damit sie ihren Willen bekommt."
    },
    {
      "name": "Wortklauberei (Word Salad)",
      "simple": "Verwirrt dich mit sinnlosen, widersprüchlichen und unlogischen Argumenten, bis du aufgibst.",
      "scientific": "Eine Form der Konversation, die verwirrend, unlogisch und schwer zu verfolgen ist. Sie besteht oft aus zirkulären Argumenten, Ablenkungen und dem ständigen Wechsel des Themas, um eine rationale Diskussion zu vermeiden und den Gegner zu zermürben."
    },
    {
      "name": "Verschieben der Torpfosten (Moving the Goalposts)",
      "simple": "Egal was du tust, es ist nie gut genug. Die Erwartungen werden ständig geändert, sodass du nie 'gewinnen' kannst.",
      "scientific": "Eine manipulative Taktik, bei der die Kriterien für einen Erfolg willkürlich geändert werden, nachdem das Ziel sie bereits erfüllt hat. Dies stellt sicher, dass das Ziel nie zufriedenstellend ist und sich ständig bemühen muss, was dem Manipulator ein Gefühl der Macht gibt."
    },
    {
      "name": "Konversations-Narzissmus",
      "simple": "Lenkt jedes Gespräch sofort wieder auf sich selbst. Deine Erlebnisse werden nur als Sprungbrett für eigene Geschichten genutzt.",
      "scientific": "Eine Form des Aufmerksamkeitsstrebens, bei der eine Person dazu neigt, Gespräche zu dominieren, indem sie den Fokus ständig auf sich selbst lenkt. Anstatt zuzuhören und zu antworten, wartet die Person nur auf eine Gelegenheit, über sich selbst zu sprechen."
    },
    {
      "name": "Schweigende Behandlung (Silent Treatment)",
      "simple": "Bestraft dich mit Schweigen und Ignoranz, um Kontrolle auszuüben.",
      "scientific": "Eine passive-aggressive Form des emotionalen Missbrauchs, bei der eine Person die verbale und elektronische Kommunikation mit einer anderen Person verweigert. Dies wird als Bestrafung und zur Ausübung von Macht und Kontrolle eingesetzt."
    }
  ];

export const OMA_QUOTES = [
    "Momentchen, Oma spitzt mal die Ohren...",
    "Ich schau mal in meine Kristallkugel...",
    "Das stricke ich mir mal kurz zusammen...",
    "Lass die Oma mal machen, Kindchen...",
    "Ich rieche da was... mal genauer schnüffeln...",
    "Das kenne ich doch irgendwoher...",
    "Ein kluges Wort zur rechten Zeit... kommt sofort.",
    "Ich poliere mal kurz meine psychologische Lupe."
];
