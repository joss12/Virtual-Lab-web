export type LocalizedText = {
  en: string;
  fr: string;
};

export type StudyComponent = {
  name: LocalizedText;
  icon: string;
  cat: LocalizedText;
  tag: LocalizedText;
  ov: LocalizedText;
  hist?: [string, LocalizedText][];
  types?: [LocalizedText, LocalizedText][];
  conn?: [LocalizedText, LocalizedText][];
  cmds?: {
    windows: [string, LocalizedText][];
    mac: [string, LocalizedText][];
    linux: [string, LocalizedText][];
  };
};

export const STUDY_DATA: Record<string, StudyComponent> = {
  keyboard: {
    name: {
      en: "Keyboard",
      fr: "Clavier",
    },
    icon: "⌨",
    cat: {
      en: "Input",
      fr: "Entrée",
    },
    tag: {
      en: "Your primary bridge between thought and machine",
      fr: "Votre passerelle principale entre la pensée et la machine",
    },
    ov: {
      en: `The computer keyboard is the most fundamental input device ever created for personal computing. It operates by converting physical key presses into digital signals through one of several switch mechanisms, then transmitting those signals to the host computer via a standardized communication protocol.

At the hardware level, every key press closes an electrical circuit. The keyboard's internal microcontroller — typically an 8-bit or 32-bit ARM processor — continuously scans the key matrix at rates between 125Hz and 8000Hz, detecting which row-column intersections are closed. When a closure is detected, the controller generates a scancode unique to that physical key position and transmits it to the operating system via HID (Human Interface Device) protocol over USB, Bluetooth, or the legacy PS/2 interface.

The OS keyboard driver translates the scancode into a virtual key code, then into a Unicode character based on the active keyboard layout (QWERTY, AZERTY, Dvorak, Colemak, etc.). This two-layer translation means the same physical keyboard can type in any language by switching the software layout without changing any hardware.

Key matrix ghosting is a critical limitation of older designs: when three keys form an L-shape in the matrix, a phantom fourth keypress can be falsely reported. N-key rollover (NKRO) solves this by giving every key its own dedicated detection line, allowing up to all keys to be pressed simultaneously without conflict — critical for gaming and fast typing.

Switch actuation force, pre-travel distance, and tactile feedback all affect typing speed and fatigue. Professional typists often prefer 45–55g actuation force. Gamers often prefer linear switches with shorter actuation distances (1.2–1.5mm) for faster response. Ergonomists recommend split designs that keep wrists in neutral pronation to prevent repetitive strain injury.

The keycap profile (SA, DSA, Cherry, OEM) determines the angle and height of each row, affecting how fingers naturally fall across the keyboard. High-profile SA keycaps give a retro typewriter feel; low-profile keycaps reduce finger travel and suit laptop-style typing. Doubleshot PBT keycaps are preferred for their durability — the legends are molded through the entire cap and never wear off.`,
      fr: `Le clavier d’ordinateur est le périphérique d’entrée le plus fondamental jamais créé pour l’informatique personnelle. Son rôle consiste à convertir les pressions physiques sur les touches en signaux numériques au moyen de différents mécanismes d’interrupteurs, puis à transmettre ces signaux à l’ordinateur hôte via un protocole de communication standardisé.

Au niveau matériel, chaque pression sur une touche ferme un circuit électrique. Le microcontrôleur interne du clavier — généralement un processeur ARM 8 bits ou 32 bits — analyse en continu la matrice des touches à des fréquences allant de 125 Hz à 8000 Hz afin de détecter quelles intersections ligne-colonne sont fermées. Lorsqu’une fermeture est détectée, le contrôleur génère un scancode propre à la position physique de la touche et l’envoie au système d’exploitation via le protocole HID (Human Interface Device), par USB, Bluetooth ou l’ancienne interface PS/2.

Le pilote clavier du système d’exploitation traduit ensuite ce scancode en code de touche virtuel, puis en caractère Unicode selon la disposition active du clavier (QWERTY, AZERTY, Dvorak, Colemak, etc.). Cette traduction en deux étapes signifie qu’un même clavier physique peut saisir n’importe quelle langue simplement en changeant la disposition logicielle, sans aucune modification matérielle.

Le ghosting de matrice est une limitation importante des anciens modèles : lorsque trois touches forment un L dans la matrice, une quatrième touche fantôme peut être détectée à tort. Le N-key rollover (NKRO) résout ce problème en donnant à chaque touche sa propre ligne de détection, ce qui permet de presser simultanément un très grand nombre de touches sans conflit — un point essentiel pour le jeu vidéo et la frappe rapide.

La force d’activation, la distance de pré-course et le retour tactile influencent tous la vitesse de frappe et la fatigue. Les dactylographes professionnels préfèrent souvent une force d’activation de 45 à 55 g. Les joueurs privilégient souvent des switches linéaires avec une distance d’activation plus courte (1,2 à 1,5 mm) pour une réponse plus rapide. Les ergonomes recommandent les claviers séparés afin de garder les poignets dans une position plus neutre et de réduire les risques de lésions liées aux mouvements répétitifs.

Le profil des keycaps (SA, DSA, Cherry, OEM) détermine l’angle et la hauteur de chaque rangée, ce qui influence la façon dont les doigts se posent naturellement sur le clavier. Les keycaps SA, plus hauts, offrent une sensation rétro proche de celle d’une machine à écrire ; les keycaps plus bas réduisent le déplacement des doigts et conviennent mieux à une frappe de style portable. Les keycaps en PBT double injection sont particulièrement appréciés pour leur durabilité : les légendes sont moulées dans toute l’épaisseur de la touche et ne s’effacent jamais.`,
    },

    hist: [
      [
        "1714",
        {
          en: "Henry Mill receives the first patent for a typewriting machine in Britain, though no working model survives",
          fr: "Henry Mill reçoit en Grande-Bretagne le premier brevet pour une machine à écrire, bien qu’aucun modèle fonctionnel n’ait survécu.",
        },
      ],
      [
        "1868",
        {
          en: "Christopher Latham Sholes patents the first practical typewriter with collaborators Glidden and Soule in Milwaukee, Wisconsin",
          fr: "Christopher Latham Sholes dépose le brevet de la première machine à écrire réellement pratique avec ses collaborateurs Glidden et Soule, à Milwaukee dans le Wisconsin.",
        },
      ],
      [
        "1873",
        {
          en: "Sholes sells the typewriter patent to Remington and Sons — the QWERTY layout is standardized to prevent type-arm jamming on fast keypairs",
          fr: "Sholes vend le brevet de la machine à écrire à Remington and Sons — la disposition QWERTY est standardisée afin de limiter le blocage des bras de frappe lors des combinaisons rapides de touches.",
        },
      ],
      [
        "1874",
        {
          en: "Remington No.1 reaches market — the first commercially successful typewriter, establishing QWERTY as the global standard",
          fr: "La Remington No.1 arrive sur le marché — c’est la première machine à écrire à succès commercial, ce qui contribue à imposer le QWERTY comme standard mondial.",
        },
      ],
      [
        "1932",
        {
          en: "August Dvorak patents the Dvorak Simplified Keyboard, claiming 74% of keystrokes on the home row vs 32% for QWERTY",
          fr: "August Dvorak dépose le brevet du Dvorak Simplified Keyboard, affirmant que 74 % des frappes se font sur la rangée de repos, contre 32 % pour le QWERTY.",
        },
      ],
      [
        "1946",
        {
          en: "First electronic computer keyboards appear — modified IBM electric typewriters connected to ENIAC and similar machines",
          fr: "Les premiers claviers électroniques pour ordinateurs apparaissent — il s’agit notamment de machines à écrire électriques IBM modifiées et reliées à l’ENIAC et à d’autres machines similaires.",
        },
      ],
      [
        "1964",
        {
          en: "IBM Selectric introduces the typing ball — replacing individual type arms with a single spinning element, enabling faster typing",
          fr: "L’IBM Selectric introduit la boule de frappe — elle remplace les bras de frappe individuels par un unique élément rotatif, permettant une frappe plus rapide.",
        },
      ],
      [
        "1981",
        {
          en: "IBM Model F ships with the IBM PC 5150 — uses buckling spring switches with 65g actuation force, widely considered the finest keyboard ever made",
          fr: "Le modèle IBM Model F accompagne l’IBM PC 5150 — il utilise des switches à ressort basculant avec une force d’activation de 65 g et est souvent considéré comme l’un des meilleurs claviers jamais conçus.",
        },
      ],
      [
        "1984",
        {
          en: "IBM Model M refines the Model F design — still manufactured new today by Unicomp after 40 years",
          fr: "L’IBM Model M affine le design du Model F — il est encore fabriqué aujourd’hui par Unicomp, plus de quarante ans après.",
        },
      ],
      [
        "1986",
        {
          en: "Cherry MX switches patented — the linear, tactile, and clicky variants become the foundation of the modern mechanical keyboard market",
          fr: "Les switches Cherry MX sont brevetés — leurs variantes linéaires, tactiles et clicky deviennent la base du marché moderne des claviers mécaniques.",
        },
      ],
      [
        "1992",
        {
          en: "Membrane keyboards become dominant as PC prices fall — cheaper to manufacture, quieter, but far less tactile",
          fr: "Les claviers à membrane deviennent dominants à mesure que les prix des PC baissent — ils sont moins chers à fabriquer, plus silencieux, mais nettement moins tactiles.",
        },
      ],
      [
        "1999",
        {
          en: "USB HID standard fully replaces proprietary keyboard protocols — any keyboard works on any OS",
          fr: "Le standard USB HID remplace entièrement les protocoles propriétaires de clavier — n’importe quel clavier peut alors fonctionner sur n’importe quel système d’exploitation.",
        },
      ],
      [
        "2007",
        {
          en: "Das Keyboard launches as one of the first premium mechanical keyboards marketed to mainstream consumers",
          fr: "Das Keyboard est lancé comme l’un des premiers claviers mécaniques haut de gamme destinés au grand public.",
        },
      ],
      [
        "2012",
        {
          en: "Massdrop (now Drop) and GeekHack forums ignite the custom keyboard group-buy community",
          fr: "Massdrop (aujourd’hui Drop) et les forums GeekHack dynamisent la communauté des achats groupés autour des claviers custom.",
        },
      ],
      [
        "2014",
        {
          en: "Topre electrostatic capacitive switches gain international attention — combining rubber dome feel with mechanical precision",
          fr: "Les switches capacitifs électrostatiques Topre attirent l’attention à l’international — ils combinent la sensation d’un dôme en caoutchouc avec la précision d’un clavier mécanique.",
        },
      ],
      [
        "2020s",
        {
          en: "Gasket-mount, wireless hot-swap, and 75% form factors dominate the enthusiast market; mainstream shifts to low-profile and ergonomic split designs",
          fr: "Dans les années 2020, les montages gasket, le hot-swap sans fil et les formats 75 % dominent le marché des passionnés, tandis que le grand public s’oriente davantage vers des modèles low-profile et ergonomiques séparés.",
        },
      ],
    ],

    types: [
      [
        {
          en: "Membrane / rubber dome",
          fr: "Membrane / dôme en caoutchouc",
        },
        {
          en: "The most common keyboard type worldwide. A rubber dome sits under each keycap; pressing collapses the dome onto a conductive membrane, completing the circuit. Extremely quiet and inexpensive to manufacture. Actuation force varies widely (45–80g). Key feel is mushy and imprecise — no tactile bump at actuation point. Found in virtually every office and laptop environment. Lifespan ~5–10 million keystrokes per key.",
          fr: "C’est le type de clavier le plus répandu dans le monde. Un dôme en caoutchouc se trouve sous chaque keycap ; lorsqu’on appuie, il s’écrase contre une membrane conductrice et ferme le circuit. Ce système est très silencieux et peu coûteux à fabriquer. La force d’activation varie fortement (45 à 80 g). La sensation de frappe est souvent molle et imprécise, sans véritable point tactile au moment de l’activation. On le retrouve dans la quasi-totalité des environnements de bureau et sur la plupart des ordinateurs portables. Sa durée de vie tourne autour de 5 à 10 millions de frappes par touche.",
        },
      ],
      [
        {
          en: "Scissor switch",
          fr: "Interrupteur à ciseaux",
        },
        {
          en: "A refined membrane design used in laptop keyboards and slim desktop boards. Two interlocking plastic pieces (the scissors) stabilize each keycap and guide its vertical travel. Provides much better key stability than standard membrane, shorter travel (1–2mm), and more consistent feel. Used in Apple Magic Keyboard, Microsoft Surface Keyboard, and most laptop keyboards since the early 2000s.",
          fr: "Il s’agit d’une version améliorée du clavier à membrane, utilisée sur les claviers d’ordinateurs portables et les modèles de bureau ultra-fins. Deux petites pièces en plastique imbriquées — le mécanisme à ciseaux — stabilisent chaque touche et guident son déplacement vertical. Ce système offre une bien meilleure stabilité qu’une membrane classique, une course plus courte (1 à 2 mm) et une sensation plus régulière. On le retrouve notamment sur l’Apple Magic Keyboard, le Microsoft Surface Keyboard et la majorité des claviers de portables depuis le début des années 2000.",
        },
      ],
      [
        {
          en: "Mechanical switch",
          fr: "Switch mécanique",
        },
        {
          en: "Each key has its own independent spring-loaded switch mechanism. Three main variants: Linear (smooth press from top to bottom — Cherry MX Red, Gateron Yellow), Tactile (physical bump at actuation point — Cherry MX Brown, Gateron Brown, Boba U4), and Clicky (audible click at actuation — Cherry MX Blue, Kailh BOX White). Lifespan 50–100 million keystrokes. Fully repairable and customizable.",
          fr: "Chaque touche dispose de son propre mécanisme de switch à ressort indépendant. On distingue trois grandes variantes : linéaire (pression fluide du haut vers le bas — Cherry MX Red, Gateron Yellow), tactile (présence d’un point de résistance au moment de l’activation — Cherry MX Brown, Gateron Brown, Boba U4) et clicky (clic sonore au point d’activation — Cherry MX Blue, Kailh BOX White). Leur durée de vie se situe entre 50 et 100 millions de frappes. Ils sont entièrement réparables et personnalisables.",
        },
      ],
      [
        {
          en: "Optical switch",
          fr: "Switch optique",
        },
        {
          en: "Uses an infrared light beam instead of physical contact to register keypresses. A shutter on the key stem breaks the beam at actuation. No debounce delay needed — response time under 0.2ms. No oxidation or contact wear. Used in Razer Optical, Gateron Optical, and Wooting analog switches. Wooting's Hall Effect variant uses magnets for analog actuation depth.",
          fr: "Ce type de switch utilise un faisceau infrarouge au lieu d’un contact physique pour détecter l’appui sur une touche. Un obturateur situé sur la tige de la touche coupe le faisceau au moment de l’activation. Il n’y a donc pas besoin de délai de debounce, ce qui permet un temps de réponse inférieur à 0,2 ms. Il n’y a ni oxydation ni usure de contact. Cette technologie est utilisée dans les Razer Optical, Gateron Optical et certains switches analogiques de Wooting. La variante Hall Effect de Wooting emploie quant à elle des aimants pour mesurer la profondeur d’activation.",
        },
      ],
      [
        {
          en: "Hall Effect / magnetic",
          fr: "Effet Hall / magnétique",
        },
        {
          en: "Uses a Hall Effect sensor that measures the magnetic field of a magnet embedded in the key stem. Enables true analog input — the OS can read exact key position, not just pressed/not pressed. Wooting keyboards use this for variable walking speed in games. Extremely long lifespan as there are no contacts to wear.",
          fr: "Ce système repose sur un capteur à effet Hall qui mesure le champ magnétique d’un aimant intégré à la tige de la touche. Il permet une véritable entrée analogique : le système d’exploitation peut lire la position exacte de la touche, et pas seulement savoir si elle est pressée ou non. Les claviers Wooting utilisent cette technologie pour permettre, par exemple, une vitesse de déplacement variable dans les jeux. La durée de vie est extrêmement longue puisqu’il n’y a aucun contact mécanique à user.",
        },
      ],
      [
        {
          en: "Electrostatic capacitive (Topre)",
          fr: "Capacitif électrostatique (Topre)",
        },
        {
          en: "A hybrid design combining a rubber dome with a capacitive spring. The dome provides tactile feedback; a capacitive sensor detects the change in electrical field as the dome compresses. No physical contact at actuation. Very smooth, rounded tactile bump. Used in Topre RealForce and HHKBKeyboard. Premium pricing (~$200–350) but beloved by professional typists.",
          fr: "Il s’agit d’une conception hybride combinant un dôme en caoutchouc et un ressort capacitif. Le dôme fournit le retour tactile, tandis qu’un capteur capacitif détecte la variation de champ électrique lorsque le dôme se comprime. Il n’y a donc aucun contact physique au moment de l’activation. La sensation tactile est très douce, progressive et arrondie. Cette technologie est utilisée dans les claviers Topre RealForce et HHKB. Le prix est élevé (environ 200 à 350 dollars), mais elle est particulièrement appréciée des dactylographes professionnels.",
        },
      ],
      [
        {
          en: "Ergonomic / split",
          fr: "Ergonomique / séparé",
        },
        {
          en: "Split keyboards separate the two halves of the keyboard (sometimes 20–30cm apart) to allow each hand to maintain a natural shoulder-width position. Reduces wrist pronation and ulnar deviation. Examples: ZSA Moonlander, Kinesis Advantage 360, Dygma Defy. Tenting (raising the inner edge) further reduces forearm rotation. Steep learning curve but can eliminate repetitive strain injury.",
          fr: "Les claviers séparés divisent le clavier en deux moitiés, parfois espacées de 20 à 30 cm, afin que chaque main puisse rester dans une position naturelle, proche de la largeur des épaules. Cela réduit la pronation du poignet et la déviation ulnaire. Exemples : ZSA Moonlander, Kinesis Advantage 360, Dygma Defy. Le tenting, qui consiste à relever le bord intérieur, réduit encore davantage la rotation de l’avant-bras. La prise en main demande un certain temps, mais cette approche peut aider à prévenir, voire à réduire, les troubles liés aux mouvements répétitifs.",
        },
      ],
    ],

    conn: [
      [
        {
          en: "PS/2 (DIN-5 / DIN-6)",
          fr: "PS/2 (DIN-5 / DIN-6)",
        },
        {
          en: "Purple 6-pin mini-DIN connector introduced by IBM in 1987 for the IBM PC/AT. Electrically simple — runs a synchronous serial protocol. Key advantage: true hardware-level N-key rollover since the host polls at will rather than receiving USB packets. Not hot-swappable — must be connected before boot. Still preferred for legacy BIOS environments and competitive gaming on older hardware. Electrically identical to the mouse port (green) — only distinguished by color convention.",
          fr: "Connecteur mini-DIN violet à 6 broches introduit par IBM en 1987 pour l’IBM PC/AT. Sur le plan électrique, il est simple et fonctionne avec un protocole série synchrone. Son principal avantage est de permettre un véritable N-key rollover au niveau matériel, car l’hôte interroge directement le périphérique au lieu de recevoir des paquets USB. Il n’est pas hot-swappable : il doit être branché avant le démarrage de la machine. Il reste apprécié dans certains environnements BIOS anciens et pour le jeu compétitif sur du matériel plus ancien. Électriquement, il est identique au port souris (vert) ; seule la couleur permet de les distinguer.",
        },
      ],
      [
        {
          en: "USB Type-A (HID)",
          fr: "USB Type-A (HID)",
        },
        {
          en: "The universal standard since 1998. Keyboards appear to the OS as HID (Human Interface Device) class devices, requiring no special drivers. Default USB polling rate is 125Hz (8ms latency); gaming keyboards poll at 1000Hz (1ms), with some recent models at 4000Hz or 8000Hz. The USB HID Boot Protocol supports a maximum of 6 simultaneous keypresses (6KRO) for compatibility with BIOS/UEFI. Most gaming keyboards implement full NKRO via USB HID Report Protocol instead.",
          fr: "C’est le standard universel depuis 1998. Les claviers sont reconnus par le système d’exploitation comme des périphériques de classe HID (Human Interface Device), sans pilote spécifique à installer. La fréquence d’interrogation USB par défaut est de 125 Hz (latence de 8 ms) ; les claviers gaming montent généralement à 1000 Hz (1 ms), et certains modèles récents atteignent 4000 Hz ou 8000 Hz. Le protocole USB HID Boot prend en charge jusqu’à 6 frappes simultanées (6KRO) afin de rester compatible avec le BIOS/UEFI. La plupart des claviers gaming utilisent plutôt le protocole USB HID Report pour offrir un NKRO complet.",
        },
      ],
      [
        {
          en: "USB-C",
          fr: "USB-C",
        },
        {
          en: "Reversible connector increasingly common on premium keyboards since ~2018. Carries the same USB HID protocol as Type-A but in a more durable, reversible form factor. Some keyboards use USB-C for both wired connection and charging the internal battery in wireless mode (acting as a charging port when wireless, data port when wired).",
          fr: "Connecteur réversible de plus en plus courant sur les claviers haut de gamme depuis environ 2018. Il transporte le même protocole USB HID que l’USB Type-A, mais dans un format plus moderne, plus robuste et réversible. Certains claviers utilisent l’USB-C à la fois pour la connexion filaire et pour recharger leur batterie interne en mode sans fil : il sert alors de port de charge en mode sans fil et de port de données en mode filaire.",
        },
      ],
      [
        {
          en: "Bluetooth 5.x",
          fr: "Bluetooth 5.x",
        },
        {
          en: "Wireless standard for keyboards. Pairs with up to 4–5 devices simultaneously; switch between them with a key combination. Latency ranges from 5–15ms depending on implementation — imperceptible for typing, potentially noticeable for competitive gaming. Power draw is very low — most wireless keyboards last 1–12 months per charge or per set of AAA batteries. Susceptible to 2.4GHz interference from Wi-Fi routers on crowded channels.",
          fr: "Standard sans fil pour les claviers. Il permet souvent d’appairer jusqu’à 4 ou 5 appareils simultanément et de passer de l’un à l’autre à l’aide d’une combinaison de touches. La latence varie de 5 à 15 ms selon l’implémentation — imperceptible pour la frappe, mais parfois sensible dans le jeu compétitif. La consommation d’énergie est très faible : la plupart des claviers sans fil tiennent de 1 à 12 mois par charge ou avec un jeu de piles AAA. En revanche, le Bluetooth peut subir des interférences sur la bande 2,4 GHz, notamment à proximité de routeurs Wi-Fi sur des canaux encombrés.",
        },
      ],
      [
        {
          en: "2.4GHz RF dongle",
          fr: "Dongle RF 2,4 GHz",
        },
        {
          en: "Proprietary wireless using a dedicated USB dongle operating in the 2.4GHz ISM band. Unlike Bluetooth, the keyboard and dongle are paired at the factory and communicate using a custom low-latency protocol. Achieves ~1ms latency — indistinguishable from wired. Used in Logitech LIGHTSPEED, Corsair SLIPSTREAM, and Razer HyperSpeed. The dongle occupies one USB-A port permanently. No Bluetooth — cannot pair with phones or tablets.",
          fr: "Connexion sans fil propriétaire utilisant un dongle USB dédié fonctionnant sur la bande ISM 2,4 GHz. Contrairement au Bluetooth, le clavier et le dongle sont appairés en usine et communiquent via un protocole personnalisé à faible latence. On obtient ainsi une latence d’environ 1 ms, pratiquement identique à celle d’une connexion filaire. Cette approche est utilisée par Logitech LIGHTSPEED, Corsair SLIPSTREAM et Razer HyperSpeed. Le dongle occupe en permanence un port USB-A. En général, il ne permet pas l’appairage avec des téléphones ou des tablettes comme le ferait le Bluetooth.",
        },
      ],
    ],

    cmds: {
      windows: [
        [
          "Ctrl + C",
          {
            en: "Copy selected text or files",
            fr: "Copier le texte ou les fichiers sélectionnés",
          },
        ],
        [
          "Ctrl + V",
          { en: "Paste from clipboard", fr: "Coller depuis le presse-papiers" },
        ],
        [
          "Ctrl + X",
          {
            en: "Cut selected text or files",
            fr: "Couper le texte ou les fichiers sélectionnés",
          },
        ],
        [
          "Ctrl + Z",
          { en: "Undo last action", fr: "Annuler la dernière action" },
        ],
        [
          "Ctrl + Y",
          {
            en: "Redo last undone action",
            fr: "Rétablir la dernière action annulée",
          },
        ],
        [
          "Ctrl + A",
          {
            en: "Select all items in current context",
            fr: "Tout sélectionner dans le contexte actuel",
          },
        ],
        [
          "Ctrl + S",
          { en: "Save current file", fr: "Enregistrer le fichier actuel" },
        ],
        ["Ctrl + F", { en: "Open Find dialog", fr: "Ouvrir la recherche" }],
        [
          "Ctrl + P",
          { en: "Print current document", fr: "Imprimer le document actuel" },
        ],
        [
          "Ctrl + N",
          {
            en: "New file or window",
            fr: "Créer un nouveau fichier ou une nouvelle fenêtre",
          },
        ],
        [
          "Ctrl + W",
          {
            en: "Close current tab or window",
            fr: "Fermer l’onglet ou la fenêtre actuelle",
          },
        ],
        [
          "Ctrl + T",
          {
            en: "Open new browser tab",
            fr: "Ouvrir un nouvel onglet du navigateur",
          },
        ],
        [
          "Ctrl + Shift + T",
          {
            en: "Reopen last closed tab",
            fr: "Rouvrir le dernier onglet fermé",
          },
        ],
        [
          "Alt + Tab",
          {
            en: "Switch between open windows",
            fr: "Basculer entre les fenêtres ouvertes",
          },
        ],
        [
          "Alt + F4",
          {
            en: "Close active window or application",
            fr: "Fermer la fenêtre ou l’application active",
          },
        ],
        [
          "Win + D",
          {
            en: "Show or hide the desktop",
            fr: "Afficher ou masquer le bureau",
          },
        ],
        [
          "Win + L",
          {
            en: "Lock the computer immediately",
            fr: "Verrouiller l’ordinateur immédiatement",
          },
        ],
        [
          "Win + E",
          { en: "Open File Explorer", fr: "Ouvrir l’Explorateur de fichiers" },
        ],
        [
          "Win + R",
          {
            en: "Open the Run dialog",
            fr: "Ouvrir la boîte de dialogue Exécuter",
          },
        ],
        ["Win + I", { en: "Open Settings", fr: "Ouvrir les paramètres" }],
        ["Win + S", { en: "Open Search", fr: "Ouvrir la recherche" }],
        [
          "Win + Shift + S",
          {
            en: "Open Snipping Tool for screenshot",
            fr: "Ouvrir l’outil de capture d’écran",
          },
        ],
        [
          "Win + ←/→",
          {
            en: "Snap window to left or right half",
            fr: "Ancrer la fenêtre à gauche ou à droite",
          },
        ],
        ["Win + ↑", { en: "Maximize window", fr: "Agrandir la fenêtre" }],
        [
          "Win + ↓",
          {
            en: "Minimize or restore window",
            fr: "Réduire ou restaurer la fenêtre",
          },
        ],
        [
          "Ctrl + Shift + Esc",
          {
            en: "Open Task Manager directly",
            fr: "Ouvrir directement le Gestionnaire des tâches",
          },
        ],
        [
          "Ctrl + Alt + Del",
          {
            en: "Open security options screen",
            fr: "Ouvrir l’écran des options de sécurité",
          },
        ],
        [
          "F2",
          {
            en: "Rename selected file or folder",
            fr: "Renommer le fichier ou le dossier sélectionné",
          },
        ],
        [
          "F5",
          {
            en: "Refresh current window or page",
            fr: "Actualiser la fenêtre ou la page actuelle",
          },
        ],
        [
          "Delete",
          { en: "Move to Recycle Bin", fr: "Déplacer vers la Corbeille" },
        ],
        [
          "Shift + Delete",
          {
            en: "Permanently delete without Recycle Bin",
            fr: "Supprimer définitivement sans passer par la Corbeille",
          },
        ],
        [
          "Print Screen",
          {
            en: "Copy full screenshot to clipboard",
            fr: "Copier une capture d’écran complète dans le presse-papiers",
          },
        ],
        [
          "Win + Print Screen",
          {
            en: "Save screenshot to Pictures/Screenshots",
            fr: "Enregistrer la capture d’écran dans Images/Captures d’écran",
          },
        ],
        [
          "Win + Space",
          { en: "Switch input language", fr: "Changer la langue de saisie" },
        ],
        [
          "Ctrl + Shift",
          {
            en: "Switch keyboard layout",
            fr: "Changer la disposition du clavier",
          },
        ],
      ],
      mac: [
        ["⌘ + C", { en: "Copy", fr: "Copier" }],
        ["⌘ + V", { en: "Paste", fr: "Coller" }],
        ["⌘ + X", { en: "Cut", fr: "Couper" }],
        ["⌘ + Z", { en: "Undo", fr: "Annuler" }],
        ["⌘ + Shift + Z", { en: "Redo", fr: "Rétablir" }],
        ["⌘ + A", { en: "Select all", fr: "Tout sélectionner" }],
        ["⌘ + S", { en: "Save", fr: "Enregistrer" }],
        ["⌘ + F", { en: "Find", fr: "Rechercher" }],
        ["⌘ + P", { en: "Print", fr: "Imprimer" }],
        [
          "⌘ + N",
          {
            en: "New window or document",
            fr: "Nouvelle fenêtre ou nouveau document",
          },
        ],
        ["⌘ + W", { en: "Close window", fr: "Fermer la fenêtre" }],
        ["⌘ + Q", { en: "Quit application", fr: "Quitter l’application" }],
        [
          "⌘ + Tab",
          {
            en: "Switch between open applications",
            fr: "Basculer entre les applications ouvertes",
          },
        ],
        [
          "⌘ + Space",
          { en: "Open Spotlight search", fr: "Ouvrir la recherche Spotlight" },
        ],
        [
          "⌘ + Option + Esc",
          {
            en: "Force quit applications",
            fr: "Forcer la fermeture des applications",
          },
        ],
        [
          "⌘ + Shift + 3",
          { en: "Screenshot entire screen", fr: "Capturer tout l’écran" },
        ],
        [
          "⌘ + Shift + 4",
          {
            en: "Screenshot selected area",
            fr: "Capturer une zone sélectionnée",
          },
        ],
        [
          "⌘ + Shift + 5",
          {
            en: "Screenshot and recording toolbar",
            fr: "Ouvrir la barre d’outils de capture et d’enregistrement",
          },
        ],
        [
          "Ctrl + ⌘ + Q",
          {
            en: "Lock screen immediately",
            fr: "Verrouiller l’écran immédiatement",
          },
        ],
        [
          "⌘ + H",
          {
            en: "Hide current application",
            fr: "Masquer l’application actuelle",
          },
        ],
        [
          "⌘ + M",
          {
            en: "Minimize window to Dock",
            fr: "Réduire la fenêtre dans le Dock",
          },
        ],
        [
          "⌘ + ,",
          {
            en: "Open application preferences",
            fr: "Ouvrir les préférences de l’application",
          },
        ],
        ["⌘ + T", { en: "New tab", fr: "Nouvel onglet" }],
        [
          "⌘ + L",
          {
            en: "Focus address bar in browser",
            fr: "Placer le curseur dans la barre d’adresse du navigateur",
          },
        ],
        ["⌘ + R", { en: "Refresh page", fr: "Actualiser la page" }],
        [
          "⌘ + D",
          {
            en: "Bookmark current page",
            fr: "Ajouter la page actuelle aux favoris",
          },
        ],
        ["⌘ + K", { en: "Insert hyperlink", fr: "Insérer un lien hypertexte" }],
        ["Fn + ←", { en: "Home (beginning of line)", fr: "Début de ligne" }],
        ["Fn + →", { en: "End (end of line)", fr: "Fin de ligne" }],
        [
          "⌘ + Delete",
          { en: "Move to Trash", fr: "Déplacer vers la Corbeille" },
        ],
      ],
      linux: [
        [
          "Ctrl + C",
          {
            en: "Copy (also: interrupt process in terminal)",
            fr: "Copier (ou interrompre un processus dans le terminal)",
          },
        ],
        ["Ctrl + V", { en: "Paste", fr: "Coller" }],
        ["Ctrl + X", { en: "Cut", fr: "Couper" }],
        ["Ctrl + Z", { en: "Undo", fr: "Annuler" }],
        ["Ctrl + A", { en: "Select all", fr: "Tout sélectionner" }],
        ["Ctrl + S", { en: "Save", fr: "Enregistrer" }],
        ["Ctrl + F", { en: "Find", fr: "Rechercher" }],
        [
          "Alt + Tab",
          { en: "Switch windows", fr: "Basculer entre les fenêtres" },
        ],
        [
          "Super + D",
          {
            en: "Show desktop (GNOME/KDE)",
            fr: "Afficher le bureau (GNOME/KDE)",
          },
        ],
        [
          "Ctrl + Alt + T",
          { en: "Open terminal emulator", fr: "Ouvrir un terminal" },
        ],
        ["Alt + F4", { en: "Close window", fr: "Fermer la fenêtre" }],
        ["Ctrl + Alt + L", { en: "Lock screen", fr: "Verrouiller l’écran" }],
        [
          "Super + ←/→",
          {
            en: "Snap window to half screen",
            fr: "Ancrer la fenêtre sur la moitié de l’écran",
          },
        ],
        ["Super + ↑", { en: "Maximize window", fr: "Agrandir la fenêtre" }],
        [
          "Print Screen",
          { en: "Take screenshot", fr: "Prendre une capture d’écran" },
        ],
        [
          "Ctrl + Alt + F2–F6",
          {
            en: "Switch to virtual TTY console",
            fr: "Basculer vers une console TTY virtuelle",
          },
        ],
        [
          "Ctrl + Alt + F7",
          {
            en: "Return to graphical session",
            fr: "Revenir à la session graphique",
          },
        ],
        [
          "Super + A",
          {
            en: "Show all applications (GNOME)",
            fr: "Afficher toutes les applications (GNOME)",
          },
        ],
        [
          "Super + S",
          { en: "Overview mode (GNOME)", fr: "Mode vue d’ensemble (GNOME)" },
        ],
        [
          "Alt + F2",
          {
            en: "Run command dialog (KDE)",
            fr: "Ouvrir la boîte de dialogue de commande (KDE)",
          },
        ],
        [
          "Ctrl + F2",
          { en: "Run command (GNOME)", fr: "Lancer une commande (GNOME)" },
        ],
        [
          "Super + L",
          { en: "Lock screen (GNOME)", fr: "Verrouiller l’écran (GNOME)" },
        ],
        [
          "Ctrl + Alt + Backspace",
          {
            en: "Kill X server (if enabled)",
            fr: "Arrêter le serveur X (si activé)",
          },
        ],
        [
          "Ctrl + Shift + U",
          {
            en: "Enter Unicode code point input mode",
            fr: "Entrer en mode de saisie Unicode",
          },
        ],
        [
          "Ctrl + H",
          {
            en: "Show hidden files in file manager",
            fr: "Afficher les fichiers cachés dans le gestionnaire de fichiers",
          },
        ],
        [
          "F1",
          {
            en: "Open help in most applications",
            fr: "Ouvrir l’aide dans la plupart des applications",
          },
        ],
        [
          "Tab",
          {
            en: "Autocomplete in terminal",
            fr: "Autocomplétion dans le terminal",
          },
        ],
        [
          "Ctrl + R",
          {
            en: "Reverse search command history in terminal",
            fr: "Recherche inversée dans l’historique du terminal",
          },
        ],
        [
          "Ctrl + L",
          { en: "Clear terminal screen", fr: "Effacer l’écran du terminal" },
        ],
        [
          "Ctrl + D",
          {
            en: "EOF / logout from terminal session",
            fr: "Fin de fichier / fermeture de session du terminal",
          },
        ],
      ],
    },
  },

  //Mouse
  mouse: {
    name: {
      en: "Mouse",
      fr: "Souris",
    },
    icon: "🖱",
    cat: {
      en: "Input",
      fr: "Entrée",
    },
    tag: {
      en: "Extending the human hand into digital space",
      fr: "Le prolongement de la main humaine dans l’espace numérique",
    },
    ov: {
      en: `The computer mouse is a pointing device that translates physical hand movement on a surface into cursor movement on screen. Modern optical mice photograph the surface thousands of times per second using a dedicated CMOS image sensor and DSP (Digital Signal Processor), computing the displacement vector between successive frames using cross-correlation algorithms.

The core optical tracking pipeline: an LED (infrared or red) illuminates the surface at a low angle. The CMOS sensor captures 4,000–25,000 frames per second at a resolution of 16×16 to 36×36 pixels. The onboard DSP compares consecutive frames, identifies texture patterns, and calculates X/Y displacement with sub-millimeter precision. This computed displacement is reported to the computer at the polling rate — anywhere from 125Hz (8ms intervals) on budget devices to 8000Hz (0.125ms) on flagship gaming mice.

DPI (dots per inch) is the most cited but most misunderstood mouse specification. DPI measures how many counts the sensor reports per inch of physical movement. A 1600 DPI setting reports 1600 counts per inch. Higher DPI amplifies small movements into large cursor displacements. For gaming, DPI is meaningless without context — a 400 DPI mouse moved at high speed covers the same screen distance as an 800 DPI mouse moved at half speed. What matters is sensor accuracy at the chosen DPI setting and whether the sensor introduces any acceleration or jitter.

Click latency is determined by the switch mechanism. Premium mice use Omron D2FC-F-7N switches rated for 20 million clicks with a mechanical latency of ~1ms. Hall Effect magnetic switches (used in Razer HyperPolling) have no mechanical travel delay. The full click-to-cursor latency pipeline includes switch debounce time (~0.5–4ms), USB polling interval (0.125–8ms), and OS input processing (~1–3ms). Total competitive gaming setups aim for <7ms total input latency.

Ergonomics significantly affect performance and health. Palm grip (whole hand rests on mouse) suits larger hands and slower, sweeping movements. Claw grip (only fingertips and palm heel touch mouse) allows faster repositioning. Fingertip grip (only fingertips contact mouse) enables maximum wrist and finger dexterity for low-DPI precise aiming. Weight matters — lighter mice (40–65g) allow faster repositioning; heavier mice (100g+) provide more control for slow movements.`,
      fr: `La souris d’ordinateur est un périphérique de pointage qui transforme le mouvement physique de la main sur une surface en déplacement du curseur à l’écran. Les souris optiques modernes photographient la surface des milliers de fois par seconde grâce à un capteur CMOS dédié et à un DSP (processeur de signal numérique), qui calcule le vecteur de déplacement entre des images successives à l’aide d’algorithmes de corrélation croisée.

Le principe central du suivi optique est le suivant : une LED, infrarouge ou rouge, éclaire la surface avec un angle faible. Le capteur CMOS capture entre 4 000 et 25 000 images par seconde, avec une résolution comprise entre 16×16 et 36×36 pixels. Le DSP embarqué compare les images successives, identifie les motifs présents dans la texture de la surface et calcule le déplacement sur les axes X et Y avec une précision inférieure au millimètre. Ce déplacement est ensuite transmis à l’ordinateur selon la fréquence d’interrogation de la souris, allant de 125 Hz (intervalle de 8 ms) sur les modèles économiques à 8000 Hz (0,125 ms) sur les souris gaming les plus haut de gamme.

Le DPI (dots per inch) est la caractéristique la plus souvent citée, mais aussi l’une des plus mal comprises. Il mesure le nombre d’unités de déplacement que le capteur rapporte pour chaque pouce de mouvement physique. Un réglage à 1600 DPI signifie donc que la souris envoie 1600 unités par pouce parcouru. Un DPI plus élevé amplifie les petits mouvements en grands déplacements du curseur. Pour le jeu vidéo, cette valeur n’a de sens qu’avec du contexte : une souris réglée à 400 DPI déplacée très vite peut couvrir la même distance à l’écran qu’une souris à 800 DPI déplacée deux fois moins vite. Ce qui compte vraiment, c’est la précision du capteur au DPI choisi, ainsi que l’absence d’accélération involontaire ou de jitter.

La latence du clic dépend avant tout du mécanisme de switch utilisé. Les souris haut de gamme emploient souvent des switches Omron D2FC-F-7N, donnés pour 20 millions de clics et avec une latence mécanique d’environ 1 ms. Les switches magnétiques à effet Hall, comme ceux utilisés dans certains systèmes HyperPolling de Razer, n’ont pas de délai mécanique lié au déplacement physique du contact. La chaîne complète entre le clic et le déplacement du curseur comprend le délai de debounce du switch (~0,5 à 4 ms), l’intervalle de polling USB (0,125 à 8 ms) et le traitement des entrées par le système d’exploitation (~1 à 3 ms). Les configurations compétitives visent généralement une latence totale inférieure à 7 ms.

L’ergonomie a un impact direct sur les performances et sur la santé. La prise en paume (palm grip), où toute la main repose sur la souris, convient aux grandes mains et aux mouvements amples et plus lents. La prise en griffe (claw grip), où seules les extrémités des doigts et la base de la paume touchent la souris, permet des repositionnements plus rapides. La prise du bout des doigts (fingertip grip), où seuls les doigts sont en contact avec la souris, offre un maximum de dextérité du poignet et des doigts pour les mouvements précis à faible DPI. Le poids joue aussi un rôle important : les souris légères (40 à 65 g) facilitent les repositionnements rapides, tandis que les modèles plus lourds (100 g et plus) apportent davantage de contrôle dans les mouvements lents.`,
    },

    hist: [
      [
        "1946",
        {
          en: "Ralph Benjamin develops the trackball for a secret British Royal Navy fire-control radar project — the conceptual ancestor of the mouse",
          fr: "Ralph Benjamin développe le trackball dans le cadre d’un projet secret de radar de conduite de tir pour la Royal Navy britannique — il s’agit de l’ancêtre conceptuel de la souris.",
        },
      ],
      [
        "1964",
        {
          en: "Douglas Engelbart and Bill English at Stanford Research Institute build the first mouse prototype — a wooden box with two perpendicular metal wheels reporting X/Y position to a cathode ray tube display",
          fr: "Douglas Engelbart et Bill English, au Stanford Research Institute, construisent le premier prototype de souris — une boîte en bois équipée de deux roues métalliques perpendiculaires capables de transmettre la position X/Y à un écran à tube cathodique.",
        },
      ],
      [
        "1968",
        {
          en: 'Engelbart publicly demonstrates the mouse at the "Mother of All Demos" — also the first public demonstration of hypertext, video conferencing, and collaborative editing',
          fr: "Engelbart présente publiquement la souris lors de la célèbre « Mother of All Demos » — qui montre aussi pour la première fois en public l’hypertexte, la visioconférence et l’édition collaborative.",
        },
      ],
      [
        "1972",
        {
          en: "Bill English refines the design with a rolling rubber ball — the ball mouse replaces perpendicular wheels and becomes the standard for 20 years",
          fr: "Bill English améliore le concept en y ajoutant une boule en caoutchouc roulante — la souris à boule remplace alors les roues perpendiculaires et devient le standard pendant près de vingt ans.",
        },
      ],
      [
        "1981",
        {
          en: "Xerox Star workstation ships as the first commercial computer to use a mouse as the primary input device — priced at $16,595",
          fr: "La station de travail Xerox Star est commercialisée comme le premier ordinateur à utiliser la souris comme périphérique principal d’entrée — au prix de 16 595 dollars.",
        },
      ],
      [
        "1984",
        {
          en: "Apple Macintosh ships with a single-button mouse at $2,495 — brings the mouse to mainstream consumers for the first time",
          fr: "L’Apple Macintosh est lancé avec une souris à un seul bouton pour 2 495 dollars — il fait découvrir la souris au grand public pour la première fois.",
        },
      ],
      [
        "1991",
        {
          en: "Logitech ships the Mouseman — first mouse with a scroll wheel, initially for scrolling through long spreadsheets",
          fr: "Logitech lance la Mouseman — l’une des premières souris dotées d’une molette de défilement, pensée au départ pour parcourir de longues feuilles de calcul.",
        },
      ],
      [
        "1999",
        {
          en: "Agilent Technologies (HP spin-off) ships the first commercial optical mouse — no ball, no moving parts, uses LED and CMOS imaging",
          fr: "Agilent Technologies, issue de HP, commercialise la première souris optique grand public — sans boule ni pièce mobile, reposant sur une LED et un système d’imagerie CMOS.",
        },
      ],
      [
        "2004",
        {
          en: "Logitech G5 launches as one of the first precision gaming mice with adjustable DPI — marks the beginning of the gaming peripherals industry",
          fr: "La Logitech G5 est lancée comme l’une des premières souris gaming de précision avec DPI réglable — elle marque le début de l’industrie moderne des périphériques de jeu.",
        },
      ],
      [
        "2009",
        {
          en: "Wireless mice with USB dongles go mainstream — Logitech Performance MX proves wireless can match wired for office use",
          fr: "Les souris sans fil avec dongle USB se généralisent — la Logitech Performance MX démontre qu’une souris sans fil peut rivaliser avec le filaire pour un usage bureautique.",
        },
      ],
      [
        "2016",
        {
          en: "Finalmouse Air58 Ninja popularizes ultralight honeycomb design — 58g mouse starts the weight reduction movement",
          fr: "La Finalmouse Air58 Ninja popularise le design alvéolé ultraléger — avec ses 58 g, elle lance la tendance à la réduction extrême du poids.",
        },
      ],
      [
        "2019",
        {
          en: "Razer introduces 8000Hz polling rate — reports mouse position 8x more frequently than 1000Hz standard, reducing motion blur in cursor movement",
          fr: "Razer introduit une fréquence de polling de 8000 Hz — la position de la souris est transmise huit fois plus souvent qu’avec le standard à 1000 Hz, ce qui réduit le flou de mouvement du curseur.",
        },
      ],
      [
        "2020s",
        {
          en: "Symmetrical ambidextrous designs, sub-50g weights, wireless at 1ms latency, and Hall Effect switches define the current premium segment",
          fr: "Dans les années 2020, les designs symétriques ambidextres, les poids inférieurs à 50 g, le sans-fil à 1 ms de latence et les switches à effet Hall définissent le segment premium actuel.",
        },
      ],
    ],

    types: [
      [
        {
          en: "Mechanical ball mouse",
          fr: "Souris mécanique à boule",
        },
        {
          en: "Uses a rubber-coated steel ball that rolls against two perpendicular plastic rollers as the mouse moves. The rollers drive optical encoders that count rotation and determine X/Y displacement. Requires a hard, clean surface — dust accumulates on the rollers and causes tracking to become erratic. Required regular cleaning. Completely obsolete since 2003 when optical sensors became affordable. Still found in some industrial environments requiring ESD-safe operation.",
          fr: "Elle utilise une boule en acier recouverte de caoutchouc qui roule contre deux rouleaux en plastique perpendiculaires lorsque la souris se déplace. Ces rouleaux entraînent des encodeurs optiques qui comptent la rotation et déterminent le déplacement sur les axes X et Y. Ce type de souris nécessite une surface dure et propre, car la poussière s’accumule sur les rouleaux et perturbe rapidement le suivi. Elle demandait donc un nettoyage régulier. Cette technologie est devenue complètement obsolète à partir de 2003, lorsque les capteurs optiques sont devenus abordables. On la retrouve encore parfois dans certains environnements industriels nécessitant une sécurité ESD.",
        },
      ],
      [
        {
          en: "Optical LED mouse",
          fr: "Souris optique à LED",
        },
        {
          en: "Standard technology since ~2003. Uses a red or infrared LED that illuminates the surface at a shallow angle, casting micro-shadows from surface texture. A CMOS sensor captures these textures at high frame rates. A dedicated DSP computes displacement from successive frames. Works on virtually any matte, textured surface. Does not track reliably on glass, mirrors, or very uniform surfaces (no texture = nothing to track). The dominant technology for office and mid-range gaming mice.",
          fr: "C’est la technologie standard depuis environ 2003. Elle utilise une LED rouge ou infrarouge qui éclaire la surface avec un angle faible, créant de minuscules ombres liées à la texture. Un capteur CMOS capture ensuite ces motifs à très haute fréquence, et un DSP dédié calcule le déplacement à partir des images successives. Elle fonctionne sur presque toutes les surfaces mates et texturées. En revanche, elle suit mal sur le verre, les miroirs ou les surfaces trop uniformes, car il n’y a pas assez de texture à analyser. C’est aujourd’hui la technologie dominante pour les souris de bureau et les souris gaming de milieu de gamme.",
        },
      ],
      [
        {
          en: "Laser mouse",
          fr: "Souris laser",
        },
        {
          en: "Uses a VCSEL (Vertical Cavity Surface Emitting Laser) instead of an LED. The laser has greater coherence, enabling tracking on smooth surfaces including glass. However, laser sensors are more prone to acceleration artifacts on fast movements and can over-track on certain surfaces (reading micro-vibrations as movement). Largely replaced by high-accuracy LED sensors in the gaming segment. Still used in precision professional devices.",
          fr: "Elle emploie un VCSEL (laser à émission de surface à cavité verticale) au lieu d’une LED. Le faisceau laser, plus cohérent, permet un meilleur suivi sur des surfaces lisses, y compris certaines surfaces en verre. En contrepartie, les capteurs laser sont plus sensibles aux artefacts d’accélération lors des mouvements rapides et peuvent surinterpréter certaines micro-vibrations de la surface comme du mouvement réel. Cette technologie a largement été remplacée par des capteurs LED très précis dans le domaine du gaming, mais elle reste utilisée dans certains périphériques professionnels de précision.",
        },
      ],
      [
        {
          en: "Trackball mouse",
          fr: "Trackball",
        },
        {
          en: "The mouse body remains stationary on the desk; the user rolls a large exposed ball with their thumb (thumb trackball) or fingers (finger trackball). The body uses optical or laser sensors to track the ball rotation. Eliminates the need to move your arm — all motion comes from wrist and finger movements. Dramatically reduces desk space requirements. Preferred by users with repetitive strain injury, limited desk space, or who work in tight environments. Learning curve: 2–4 weeks to match desktop mouse precision.",
          fr: "Avec un trackball, le corps de l’appareil reste immobile sur le bureau ; l’utilisateur fait rouler une grosse boule apparente avec le pouce ou avec les doigts selon le modèle. L’appareil utilise ensuite des capteurs optiques ou laser pour suivre la rotation de cette boule. Cela évite de devoir déplacer le bras : tout le mouvement provient alors du poignet et des doigts. L’encombrement sur le bureau est fortement réduit. Ce type de périphérique est apprécié par les personnes souffrant de troubles musculosquelettiques, disposant de peu d’espace ou travaillant dans des environnements contraints. Il faut généralement entre deux et quatre semaines pour retrouver la précision d’une souris classique.",
        },
      ],
      [
        {
          en: "Touchpad / trackpad",
          fr: "Pavé tactile / trackpad",
        },
        {
          en: "A capacitive sensing surface that detects the position and pressure of multiple fingers simultaneously. Multi-touch gestures: two-finger scroll, pinch-to-zoom, three-finger swipe, four-finger swipe. Modern precision touchpads (Windows Precision Touchpad standard) use the same gesture recognition layer as Apple Magic Trackpad. Glass surface preferred for feel. Force Touch (Apple) adds pressure sensors under the pad to simulate click feel anywhere on the surface, even when completely stationary.",
          fr: "Il s’agit d’une surface capacitive capable de détecter simultanément la position et parfois la pression de plusieurs doigts. Elle prend en charge les gestes multipoints : défilement à deux doigts, pincement pour zoomer, balayage à trois ou quatre doigts, etc. Les trackpads modernes de précision, notamment sous le standard Windows Precision Touchpad, s’appuient sur une logique de reconnaissance gestuelle comparable à celle de l’Apple Magic Trackpad. Une surface en verre est souvent préférée pour le confort de glisse. La technologie Force Touch d’Apple ajoute des capteurs de pression sous le pavé afin de simuler une sensation de clic sur toute la surface, même sans mouvement mécanique réel.",
        },
      ],
      [
        {
          en: "Pen tablet / stylus",
          fr: "Tablette graphique / stylet",
        },
        {
          en: "An electromagnetic resonance tablet detects the position of a pressure-sensitive stylus without requiring battery power in the pen. Wacom's EMR technology is the industry standard — used in Intuos, Cintiq, and the Galaxy Tab S-Pen. Pressure sensitivity of 8192 levels enables natural-feeling brush and pen strokes in digital art. Tilt recognition adds a further dimension. Preferred by digital artists, architects, and anyone doing precision graphic work.",
          fr: "Une tablette à résonance électromagnétique détecte la position d’un stylet sensible à la pression sans nécessiter de batterie dans le stylet lui-même. La technologie EMR de Wacom est la référence du secteur : on la retrouve notamment dans les gammes Intuos, Cintiq et dans le S-Pen des Galaxy Tab. Avec jusqu’à 8192 niveaux de pression, elle permet de reproduire des traits de pinceau ou de stylo très naturels en création numérique. La reconnaissance de l’inclinaison ajoute une dimension supplémentaire de contrôle. Ce type d’outil est privilégié par les artistes numériques, les architectes et tous ceux qui réalisent des travaux graphiques de haute précision.",
        },
      ],
      [
        {
          en: "Gaming mouse with on-board profiles",
          fr: "Souris gaming avec profils embarqués",
        },
        {
          en: "Purpose-built for gaming with onboard ARM processors, up to 32KB flash storage, and hardware polling at 4000–8000Hz. Stores DPI profiles, button assignments, lighting effects, and surface calibration data in onboard memory — settings persist when plugging into a different computer. Features: adjustable CPI, low-latency optical switches, PTFE feet, and cables with minimal drag. Premium flagship examples: Logitech G Pro X Superlight 2, Razer Viper V3 HyperSpeed, Zowie EC series.",
          fr: "Elle est conçue spécifiquement pour le jeu vidéo, avec des processeurs ARM embarqués, jusqu’à 32 Ko de mémoire flash et des fréquences de polling matérielles de 4000 à 8000 Hz. Les profils DPI, les affectations des boutons, les effets lumineux et les données de calibration de surface sont stockés directement dans la mémoire interne, ce qui permet de conserver les réglages lorsqu’on branche la souris sur un autre ordinateur. On y trouve souvent un CPI réglable, des switches optiques à faible latence, des patins en PTFE et des câbles à faible traînée. Parmi les références haut de gamme, on peut citer la Logitech G Pro X Superlight 2, la Razer Viper V3 HyperSpeed et la série Zowie EC.",
        },
      ],
    ],

    conn: [
      [
        {
          en: "USB Type-A (wired)",
          fr: "USB Type-A (filaire)",
        },
        {
          en: "Standard connection for all wired gaming and office mice. Uses USB HID protocol for plug-and-play operation. Polling rate of 125Hz is the USB HID default; gaming mice request higher polling rates (1000Hz, 4000Hz, 8000Hz) via the HID descriptor. Some mice use a braided USB cable with low drag for competitive gaming; others use a coiled cable for desk cable management. The physical USB-A connector is the most common failure point on wired mice — treated with daily plugging/unplugging cycles.",
          fr: "C’est la connexion standard pour les souris filaires de bureau comme pour les souris gaming. Elle repose sur le protocole USB HID, ce qui permet un fonctionnement plug-and-play. La fréquence de polling par défaut en USB HID est de 125 Hz ; les souris gaming demandent des fréquences plus élevées, comme 1000 Hz, 4000 Hz ou 8000 Hz, via leur descripteur HID. Certaines utilisent un câble tressé à faible traînée pour le jeu compétitif, tandis que d’autres adoptent un câble spiralé pour un meilleur rangement sur le bureau. Le connecteur USB-A lui-même est souvent le point de faiblesse principal des souris filaires, car il subit des branchements et débranchements répétés.",
        },
      ],
      [
        {
          en: "USB-C (wired)",
          fr: "USB-C (filaire)",
        },
        {
          en: "Reversible USB-C connector increasingly used on premium mice for both wired operation and battery charging on wireless models. The connector is more durable and easier to plug in. Some mice support USB-C to USB-C for direct laptop connection. Carries the same USB HID protocol as Type-A.",
          fr: "Le connecteur USB-C réversible est de plus en plus utilisé sur les souris haut de gamme, à la fois pour le fonctionnement filaire et pour la recharge des modèles sans fil. Il est plus robuste et plus pratique à brancher. Certaines souris prennent même en charge une connexion USB-C vers USB-C directe avec un ordinateur portable. Il transporte le même protocole USB HID que l’USB Type-A.",
        },
      ],
      [
        {
          en: "Bluetooth 5.x",
          fr: "Bluetooth 5.x",
        },
        {
          en: "Wireless Bluetooth connection with no additional hardware required beyond built-in Bluetooth on the host computer. Supports multiple paired devices — many Bluetooth mice can switch between 2–3 devices by holding a button. Typical latency 8–15ms. Power efficient — most Bluetooth mice last 1–3 months on a single AA battery. Limitation: Bluetooth connections are subject to interference from other 2.4GHz devices and can experience momentary disconnections in crowded wireless environments. Insufficient for competitive gaming but ideal for productivity and travel.",
          fr: "Connexion sans fil Bluetooth ne nécessitant aucun matériel supplémentaire autre que le Bluetooth intégré à l’ordinateur hôte. Elle prend souvent en charge plusieurs appareils appairés — de nombreuses souris Bluetooth permettent de basculer entre 2 ou 3 appareils via un bouton dédié. La latence typique se situe entre 8 et 15 ms. La consommation énergétique est faible : la plupart des souris Bluetooth tiennent entre un et trois mois avec une seule pile AA. En revanche, ce mode de connexion peut subir des interférences provenant d’autres appareils 2,4 GHz et occasionner de brèves coupures dans des environnements radio encombrés. Ce n’est pas idéal pour le jeu compétitif, mais c’est excellent pour la productivité et la mobilité.",
        },
      ],
      [
        {
          en: "2.4GHz RF dongle (proprietary)",
          fr: "Dongle RF 2,4 GHz (propriétaire)",
        },
        {
          en: 'Dedicated USB dongle using a private protocol in the 2.4GHz band. The dongle and mouse are paired at the factory and communicate using a custom, highly optimized low-latency protocol. Achieves 1ms effective latency (matching wired), with some implementations (Razer HyperPolling wireless) achieving 0.25ms at 4000Hz polling. The dongle must remain plugged in — it cannot pair with other devices. Some manufacturers offer "unifying" receivers that pair up to 6 devices on a single dongle (Logitech Bolt, Logi Bolt). Immune to the latency variance that affects Bluetooth.',
          fr: "Il s’agit d’un dongle USB dédié utilisant un protocole propriétaire sur la bande 2,4 GHz. Le dongle et la souris sont appairés en usine et communiquent au moyen d’un protocole personnalisé, fortement optimisé pour une faible latence. On obtient ainsi une latence effective d’environ 1 ms, équivalente à celle d’une souris filaire, et certaines implémentations — comme le Razer HyperPolling sans fil — descendent jusqu’à 0,25 ms à 4000 Hz. Le dongle doit rester branché en permanence et ne peut généralement pas être appairé à d’autres appareils. Certains fabricants proposent toutefois des récepteurs « unifiés » capables de connecter plusieurs périphériques sur un seul dongle, comme Logitech Bolt. Ce mode de connexion évite aussi les variations de latence auxquelles le Bluetooth peut être sujet.",
        },
      ],
    ],
  },

  //Monitor
  monitor: {
    name: {
      en: "Monitor",
      fr: "Moniteur",
    },
    icon: "🖥",
    cat: {
      en: "Output",
      fr: "Sortie",
    },
    tag: {
      en: "The window between you and your data",
      fr: "La fenêtre entre vous et vos données",
    },
    ov: {
      en: `The monitor is the primary output device — the interface through which all computed information becomes visible. It receives digital pixel data from the GPU, converts it into light at the correct color and intensity for each pixel, and refreshes this display at the panel's native refresh rate.

LCD (Liquid Crystal Display) panels — still the majority of monitors — work by shining white light from a backlight (historically CCFL, now universally LED) through multiple layers: a polarizing filter, a liquid crystal cell layer, a color filter array, and a second polarizer. The liquid crystal cells act as electronically controllable shutters. When voltage is applied to a cell, the liquid crystal molecules rotate, changing the polarization of light passing through and thus controlling how much light passes through the second polarizer. Subpixels (red, green, blue) are individually controlled, mixing to produce the target color.

OLED (Organic Light-Emitting Diode) panels are fundamentally different: each pixel contains organic compounds that emit light directly when current passes through them. No backlight is needed. This enables true per-pixel dimming — any pixel can be turned completely off, producing absolute black and infinite contrast ratio. OLED response time is measured in microseconds (compared to milliseconds for LCD), virtually eliminating motion blur. The main historical limitation — burn-in from static content — has been substantially mitigated in modern OLED panels through pixel-shift, logo dimming, and warranty protection programs.

Refresh rate (Hz) determines how many unique frames the display can show per second. At 60Hz, a new frame appears every 16.7ms. At 144Hz, every 6.9ms. At 360Hz, every 2.8ms. Higher refresh rates reduce perceived motion blur and stutter because the time between frames decreases. Adaptive sync (G-Sync, FreeSync) synchronizes the display refresh rate to the GPU frame rate, eliminating tearing without adding the input latency of traditional V-Sync.

HDR (High Dynamic Range) requires both a bright backlight/emissive layer and a wide color gamut. DisplayHDR 400 certification requires only 400 nits peak brightness — barely distinguishable from SDR. True HDR requires DisplayHDR 1000 or higher (1000 nits), or OLED with infinite contrast. HDR content is mastered at 1000–4000 nits; displaying it accurately on a 400-nit monitor requires aggressive tone mapping that loses highlight detail.`,
      fr: `Le moniteur est le principal périphérique de sortie — l’interface par laquelle toutes les informations calculées deviennent visibles. Il reçoit des données numériques de pixels depuis le GPU, les convertit en lumière avec la bonne couleur et la bonne intensité pour chaque pixel, puis actualise l’image selon la fréquence native de la dalle.

Les dalles LCD (Liquid Crystal Display), qui représentent encore la majorité des moniteurs, fonctionnent en faisant passer une lumière blanche provenant d’un rétroéclairage — historiquement CCFL, aujourd’hui presque toujours LED — à travers plusieurs couches : un filtre polarisant, une couche de cellules à cristaux liquides, une matrice de filtres colorés et un second polariseur. Les cellules à cristaux liquides agissent comme des obturateurs contrôlés électroniquement. Lorsqu’une tension est appliquée à une cellule, les molécules de cristal liquide pivotent, modifiant la polarisation de la lumière qui la traverse et contrôlant ainsi la quantité de lumière qui passe au travers du second polariseur. Les sous-pixels rouge, vert et bleu sont commandés individuellement et se combinent pour produire la couleur finale.

Les dalles OLED (Organic Light-Emitting Diode) sont fondamentalement différentes : chaque pixel contient des composés organiques qui émettent directement de la lumière lorsqu’un courant les traverse. Aucun rétroéclairage n’est nécessaire. Cela permet un contrôle de luminosité pixel par pixel — chaque pixel peut être complètement éteint, produisant un noir absolu et un contraste théoriquement infini. Le temps de réponse d’un OLED se mesure en microsecondes, contre des millisecondes pour un LCD, ce qui élimine presque totalement le flou de mouvement. La principale limite historique — le burn-in causé par des éléments statiques affichés trop longtemps — a été fortement réduite sur les modèles modernes grâce au décalage de pixels, à l’atténuation des logos et aux programmes de garantie spécifiques.

Le taux de rafraîchissement, exprimé en hertz (Hz), détermine le nombre d’images distinctes que l’écran peut afficher par seconde. À 60 Hz, une nouvelle image apparaît toutes les 16,7 ms. À 144 Hz, toutes les 6,9 ms. À 360 Hz, toutes les 2,8 ms. Plus la fréquence est élevée, plus la sensation de fluidité progresse et plus le flou de mouvement perçu diminue, car l’intervalle entre deux images se réduit. Les technologies de synchronisation adaptative comme G-Sync ou FreeSync synchronisent la fréquence de rafraîchissement de l’écran avec le nombre d’images générées par le GPU, ce qui élimine le tearing sans ajouter la latence d’entrée typique du V-Sync classique.

Le HDR (High Dynamic Range) exige à la fois une source lumineuse très lumineuse — ou une couche émissive performante — et un large gamut de couleurs. La certification DisplayHDR 400 ne demande qu’un pic de luminosité de 400 nits, à peine supérieur à une expérience SDR bien calibrée. Un vrai HDR nécessite plutôt du DisplayHDR 1000 ou plus, soit au moins 1000 nits, ou bien un OLED avec contraste infini. Les contenus HDR sont masterisés entre 1000 et 4000 nits ; les afficher fidèlement sur un moniteur limité à 400 nits impose un tone mapping agressif, qui fait perdre des détails dans les hautes lumières.`,
    },

    hist: [
      [
        "1897",
        {
          en: "Karl Ferdinand Braun invents the cathode ray tube (CRT) — the foundation of all display technology until the 2000s",
          fr: "Karl Ferdinand Braun invente le tube cathodique (CRT) — la base de presque toutes les technologies d’affichage jusqu’aux années 2000.",
        },
      ],
      [
        "1922",
        {
          en: "Philo Farnsworth conceives the fully electronic television, replacing mechanical scanning with electron beam scanning",
          fr: "Philo Farnsworth imagine la télévision entièrement électronique, remplaçant le balayage mécanique par un balayage par faisceau d’électrons.",
        },
      ],
      [
        "1954",
        {
          en: "RCA launches the first color CRT television — three electron guns (RGB) scan simultaneously behind a shadow mask",
          fr: "RCA lance le premier téléviseur couleur à tube cathodique — trois canons à électrons (RVB) balayent simultanément l’écran derrière un masque d’ombre.",
        },
      ],
      [
        "1964",
        {
          en: "IBM 2260 — first CRT terminal specifically designed for computer interaction, used with mainframes",
          fr: "L’IBM 2260 devient le premier terminal à tube cathodique spécifiquement conçu pour l’interaction informatique, notamment avec les mainframes.",
        },
      ],
      [
        "1973",
        {
          en: "Xerox Alto uses a high-resolution 875-line CRT — the first workstation with a GUI and WYSIWYG editing",
          fr: "Le Xerox Alto utilise un tube cathodique haute résolution de 875 lignes — c’est la première station de travail dotée d’une interface graphique et d’une édition WYSIWYG.",
        },
      ],
      [
        "1981",
        {
          en: "IBM MDA (Monochrome Display Adapter) — 720×350 resolution, text-mode only, green phosphor on black",
          fr: "L’IBM MDA (Monochrome Display Adapter) propose une résolution de 720×350, en mode texte uniquement, avec phosphore vert sur fond noir.",
        },
      ],
      [
        "1987",
        {
          en: "IBM VGA standard: 640×480 at 60Hz, 256 colors. VGA analog connector becomes the global standard for 15 years",
          fr: "Le standard VGA d’IBM impose le 640×480 à 60 Hz avec 256 couleurs. Le connecteur VGA analogique devient alors le standard mondial pendant environ quinze ans.",
        },
      ],
      [
        "1997",
        {
          en: "First commercial TFT LCD flat panel monitors reach consumers — expensive, lower quality than CRT but flat and compact",
          fr: "Les premiers moniteurs plats TFT LCD commercialisés arrivent chez les particuliers — ils sont coûteux, moins qualitatifs que les CRT, mais plats et compacts.",
        },
      ],
      [
        "2001",
        {
          en: "Apple Cinema Display 22-inch — first premium LCD that matched CRT quality, establishing LCD as the professional standard",
          fr: "L’Apple Cinema Display 22 pouces devient l’un des premiers écrans LCD haut de gamme à rivaliser avec la qualité d’un CRT, contribuant à imposer le LCD comme nouveau standard professionnel.",
        },
      ],
      [
        "2007",
        {
          en: "HDMI 1.3 enables high-definition audio and video in a single cable — replaces DVI for consumer displays",
          fr: "Le HDMI 1.3 permet de transporter audio et vidéo haute définition sur un seul câble — il remplace progressivement le DVI sur les écrans grand public.",
        },
      ],
      [
        "2009",
        {
          en: "IPS panels become affordable — color accuracy and viewing angles finally match CRT for design work",
          fr: "Les dalles IPS deviennent enfin abordables — leur précision colorimétrique et leurs angles de vision rivalisent alors avec ceux des CRT pour le travail de design.",
        },
      ],
      [
        "2012",
        {
          en: "ASUS ROG Swift PG278Q: first 144Hz TN gaming monitor — changes competitive gaming permanently",
          fr: "L’ASUS ROG Swift PG278Q s’impose comme l’un des premiers moniteurs gaming TN à 144 Hz — il transforme durablement le jeu compétitif.",
        },
      ],
      [
        "2013",
        {
          en: "4K (3840×2160) consumer monitors arrive — early models expensive, lack GPU power to drive at full resolution",
          fr: "Les moniteurs 4K (3840×2160) arrivent sur le marché grand public — les premiers modèles sont chers et les GPU de l’époque peinent à les exploiter pleinement.",
        },
      ],
      [
        "2017",
        {
          en: "ASUS ROG Swift PG258Q: first 240Hz monitor — sub-4ms motion blur becomes achievable for competitive FPS",
          fr: "L’ASUS ROG Swift PG258Q popularise le 240 Hz — un niveau où le flou de mouvement perçu descend sous la barre des 4 ms pour les FPS compétitifs.",
        },
      ],
      [
        "2019",
        {
          en: "LG 27GN950-B: first consumer IPS 4K 144Hz monitor — combines color accuracy with high refresh rate",
          fr: "Le LG 27GN950-B devient l’un des premiers moniteurs IPS 4K 144 Hz grand public — il combine haute fidélité des couleurs et fréquence élevée.",
        },
      ],
      [
        "2022",
        {
          en: "LG C2 OLED: consumer OLED panels enter the gaming market at sub-$1000 — 0.1ms response, infinite contrast",
          fr: "Le LG C2 OLED marque l’entrée des dalles OLED grand public sur le marché du gaming sous la barre des 1000 dollars — avec un temps de réponse de 0,1 ms et un contraste infini.",
        },
      ],
      [
        "2024",
        {
          en: "Samsung Odyssey OLED G8: 4K 240Hz OLED becomes the new reference for premium gaming displays",
          fr: "Le Samsung Odyssey OLED G8 aide à imposer le 4K 240 Hz OLED comme nouvelle référence des écrans gaming haut de gamme.",
        },
      ],
    ],

    types: [
      [
        {
          en: "TN (Twisted Nematic)",
          fr: "TN (Twisted Nematic)",
        },
        {
          en: "The oldest LCD panel technology. Twisted nematic liquid crystals naturally rotate light 90 degrees; voltage untwists them. Fastest pixel response time (1ms GtG advertised, ~2ms measured) due to strong voltage swing. Refresh rates up to 360Hz available. Major weaknesses: poor viewing angles (colors shift dramatically beyond 30° horizontal or vertical), narrow color gamut (typically 72% sRGB), and weak contrast ratio (800:1 to 1200:1). Being phased out of the market as fast IPS panels now match TN response times.",
          fr: "C’est la plus ancienne technologie de dalle LCD. Les cristaux liquides de type twisted nematic font naturellement pivoter la lumière de 90 degrés ; l’application d’une tension réduit ou annule cette rotation. Son principal atout est la rapidité : le temps de réponse des pixels y est historiquement le plus faible, avec souvent 1 ms GtG annoncé et environ 2 ms mesuré. On trouve des écrans TN jusqu’à 360 Hz. En revanche, ses faiblesses sont bien connues : angles de vision médiocres, couleurs qui changent fortement lorsqu’on s’écarte de l’axe, gamut limité — souvent autour de 72 % sRGB — et contraste assez faible, généralement entre 800:1 et 1200:1. Cette technologie disparaît peu à peu au profit des dalles IPS rapides, qui atteignent désormais des temps de réponse comparables.",
        },
      ],
      [
        {
          en: "IPS (In-Plane Switching)",
          fr: "IPS (In-Plane Switching)",
        },
        {
          en: "Developed by Hitachi in 1996 to address TN's poor viewing angles. The liquid crystal molecules rotate parallel to the panel surface rather than perpendicular, providing consistent color from nearly any angle (178° rated). Modern Nano-IPS and Fast IPS variants achieve 1ms GtG response at 144–360Hz. Color gamut: 95–99% sRGB, with high-end panels covering 97% DCI-P3. Contrast ratio 1000:1 typical — limited compared to VA or OLED. The go-to choice for color-critical work and versatile gaming.",
          fr: "Développée par Hitachi en 1996 pour corriger les faibles angles de vision du TN, la technologie IPS fait pivoter les molécules de cristal liquide parallèlement à la surface de la dalle plutôt que perpendiculairement. Cela permet de conserver des couleurs cohérentes depuis presque n’importe quel angle, souvent jusqu’à 178°. Les variantes modernes comme Nano-IPS ou Fast IPS atteignent désormais 1 ms GtG à 144, 240 voire 360 Hz. Le gamut se situe en général entre 95 et 99 % sRGB, et les meilleurs modèles montent jusqu’à environ 97 % DCI-P3. Le contraste natif reste cependant limité, typiquement autour de 1000:1, bien en dessous d’un VA ou d’un OLED. C’est le choix de référence pour les travaux exigeants en couleur et pour un usage gaming polyvalent.",
        },
      ],
      [
        {
          en: "VA (Vertical Alignment)",
          fr: "VA (Vertical Alignment)",
        },
        {
          en: 'Liquid crystal molecules stand vertically at rest (no light passes through) and tilt horizontally under voltage (light passes through). Produces the highest static contrast of LCD technologies: 3000:1 to 6000:1 measured, making blacks appear genuinely dark in dark rooms. Best for movie watching and HDR gaming. Main weaknesses: slower pixel response time (4–8ms) causing "smearing" on fast motion, and black crush in corners due to backlight uniformity issues. Response time is improving with VESA ClearMR-certified panels.',
          fr: "Dans une dalle VA, les molécules de cristal liquide restent verticales au repos, ce qui bloque davantage la lumière, puis s’inclinent lorsqu’une tension est appliquée. Cela permet d’obtenir le meilleur contraste statique parmi les technologies LCD, souvent entre 3000:1 et 6000:1, donnant des noirs nettement plus profonds dans une pièce sombre. Les dalles VA sont donc particulièrement appréciées pour les films et pour le gaming HDR. Leur principal défaut reste un temps de réponse plus lent, souvent entre 4 et 8 ms, ce qui peut provoquer du smearing sur les mouvements rapides. On observe aussi parfois du black crush ou des problèmes d’uniformité dans certaines zones. Les modèles récents progressent cependant grâce à de meilleures implémentations et à des certifications comme VESA ClearMR.",
        },
      ],
      [
        {
          en: "OLED (Organic LED)",
          fr: "OLED (Organic LED)",
        },
        {
          en: "Each pixel is an organic compound that emits light when current flows through it. No backlight required. True per-pixel dimming enables infinite contrast ratio — blacks are absolute zero light output. Response time is measured in microseconds (0.1ms), not milliseconds. No motion blur at any refresh rate. Ultra-wide color gamut (100% DCI-P3). The primary concern is differential aging (burn-in): static UI elements (taskbars, HUDs) can permanently imprint on the panel over hundreds of hours. Modern mitigation: pixel-shift, pixel refresher, logo detection dimming. WRGBWOLED (LG) and QD-OLED (Samsung) represent the two current implementations.",
          fr: "Dans une dalle OLED, chaque pixel est constitué d’un matériau organique qui émet directement de la lumière lorsqu’il est traversé par un courant. Aucun rétroéclairage n’est nécessaire. Cela permet un contrôle de luminosité pixel par pixel, avec des noirs absolus et un contraste perçu infini. Le temps de réponse se mesure ici en microsecondes — autour de 0,1 ms — et non en millisecondes, ce qui réduit presque totalement le flou de mouvement. Le gamut est lui aussi très large, souvent proche de 100 % du DCI-P3. La principale inquiétude reste le vieillissement différentiel, plus connu sous le nom de burn-in : des éléments statiques comme une barre des tâches ou un HUD peuvent marquer la dalle après une exposition prolongée. Les fabricants atténuent ce risque grâce au décalage de pixels, aux cycles de rafraîchissement et à l’atténuation automatique des logos. Les deux grandes familles actuelles sont le WRGB OLED de LG et le QD-OLED de Samsung.",
        },
      ],
      [
        {
          en: "QD-OLED (Quantum Dot OLED)",
          fr: "QD-OLED (Quantum Dot OLED)",
        },
        {
          en: "Samsung's hybrid technology: a blue OLED emitter layer is combined with a quantum dot color filter. Blue OLED light passes through quantum dots tuned to emit precise red and green wavelengths. Result: wider color gamut than WRGB OLED (DCI-P3 coverage up to 99%), higher peak brightness, and no white subpixel needed (better text clarity). The Alienware QD-OLED and Samsung Odyssey OLED use this technology.",
          fr: "Le QD-OLED est une technologie hybride développée par Samsung : une couche émissive OLED bleue est combinée à une couche de quantum dots chargée de produire les composantes rouge et verte. La lumière bleue traverse ces points quantiques, qui réémettent des longueurs d’onde très précises. Le résultat est un gamut plus large que sur le WRGB OLED, une luminosité de crête plus élevée et l’absence de sous-pixel blanc, ce qui peut améliorer la netteté du texte. Des écrans comme les Alienware QD-OLED ou les Samsung Odyssey OLED utilisent cette technologie.",
        },
      ],
      [
        {
          en: "Mini-LED (FALD)",
          fr: "Mini-LED (FALD)",
        },
        {
          en: 'LCD technology using thousands of individual LEDs (500–2000+) as the backlight instead of a single edge-lit strip. Each LED zone can be independently dimmed (Full Array Local Dimming). Enables much higher peak brightness (1000–2000 nits) and better contrast than standard LCD (50,000:1 claimed with FALD active). No burn-in risk. Main artifact: "blooming" — light leaks from bright zones into adjacent dark zones due to the finite size of dimming zones. Best for bright HDR gaming in well-lit rooms where OLED reflections are a concern.',
          fr: "Le Mini-LED reste une technologie LCD, mais remplace le rétroéclairage classique par des centaines, voire des milliers, de petites LED indépendantes. Ces zones peuvent être atténuées séparément grâce au Full Array Local Dimming (FALD). Cela permet d’atteindre des pics de luminosité beaucoup plus élevés — souvent entre 1000 et 2000 nits — ainsi qu’un contraste bien supérieur à celui d’un LCD standard. Il n’y a pas de risque de burn-in. Le principal défaut est le blooming : lorsqu’une zone très lumineuse voisine une zone sombre, la lumière peut déborder visuellement à cause de la taille encore finie des zones de gradation. C’est néanmoins une excellente option pour le HDR lumineux dans des pièces éclairées, où les reflets d’un OLED peuvent devenir gênants.",
        },
      ],
      [
        {
          en: "Micro-LED",
          fr: "Micro-LED",
        },
        {
          en: "Next-generation display using microscopic inorganic LEDs (each 10–100 micrometers) as individual emissive pixels — each pixel is its own self-contained LED. No organic materials means no burn-in, extremely long lifespan (100,000+ hours), very high brightness, and perfect blacks like OLED. Currently limited to very large commercial displays (Samsung The Wall) due to the extreme manufacturing complexity of placing millions of individual micro-LEDs. Expected to become consumer-viable in the late 2020s.",
          fr: "Le Micro-LED est une technologie d’affichage de nouvelle génération utilisant des LED inorganiques microscopiques — de l’ordre de 10 à 100 micromètres — comme pixels émissifs individuels. Chaque pixel est donc sa propre source lumineuse autonome. L’absence de matériaux organiques élimine pratiquement le risque de burn-in, tout en offrant une très longue durée de vie, une luminosité très élevée et des noirs parfaits comparables à ceux de l’OLED. Pour l’instant, cette technologie reste réservée à de très grands écrans commerciaux, comme Samsung The Wall, car sa fabrication exige le placement extrêmement précis de millions de micro-LEDs. Elle pourrait devenir réellement accessible au grand public dans la seconde moitié des années 2020.",
        },
      ],
    ],

    conn: [
      [
        {
          en: "HDMI 2.1 (48Gbps)",
          fr: "HDMI 2.1 (48 Gbit/s)",
        },
        {
          en: "High-Definition Multimedia Interface version 2.1, introduced in 2017. Maximum bandwidth: 48Gbps, enabling 4K at 144Hz, 4K at 240Hz (DSC), and 8K at 60Hz. Supports eARC (Enhanced Audio Return Channel) for sending Dolby Atmos and DTS:X from TV to soundbar over the same cable. Also carries HDMI CEC for device control. The most universal display connector — found on every modern GPU, TV, monitor, game console, and laptop. Cable quality matters at 4K 144Hz; use HDMI 2.1 certified cables only.",
          fr: "Le HDMI 2.1, introduit en 2017, offre une bande passante maximale de 48 Gbit/s. Cela permet notamment le 4K à 144 Hz, le 4K à 240 Hz avec DSC, ainsi que le 8K à 60 Hz. Il prend aussi en charge l’eARC (Enhanced Audio Return Channel), qui permet de transmettre des formats audio comme Dolby Atmos ou DTS:X d’un téléviseur vers une barre de son via le même câble. Le protocole HDMI CEC permet en plus le contrôle coordonné de plusieurs appareils. C’est aujourd’hui le connecteur d’affichage le plus universel, présent sur les GPU, téléviseurs, moniteurs, consoles de jeu et ordinateurs portables récents. À 4K 144 Hz, la qualité du câble devient importante : il vaut mieux utiliser un câble certifié HDMI 2.1.",
        },
      ],
      [
        {
          en: "DisplayPort 2.1 (77.4Gbps)",
          fr: "DisplayPort 2.1 (77,4 Gbit/s)",
        },
        {
          en: "VESA DisplayPort version 2.1, the highest bandwidth display connector available. 77.4Gbps enables 4K at 240Hz native (no DSC compression), 8K at 85Hz, and 16K at 60Hz with DSC. Supports Multi-Stream Transport (MST) for daisy-chaining up to 3 monitors from a single port. Preferred for gaming monitors — higher bandwidth means less need for Display Stream Compression. Also transmits power and USB data in full-size DP to USB-C cables. Not found on TVs — exclusively computer monitors and GPUs.",
          fr: "Le DisplayPort 2.1, défini par la VESA, est aujourd’hui le connecteur d’affichage offrant la plus grande bande passante, avec 77,4 Gbit/s. Cela permet par exemple le 4K à 240 Hz natif sans DSC, le 8K à 85 Hz, ou encore le 16K à 60 Hz avec compression DSC. Il prend en charge le Multi-Stream Transport (MST), qui permet de chaîner plusieurs moniteurs à partir d’un seul port. Il est particulièrement apprécié sur les écrans gaming, car sa bande passante élevée réduit le besoin de compression d’image. Il peut aussi transporter alimentation et données USB dans certains câbles DP vers USB-C. En revanche, on ne le trouve pas sur les téléviseurs : il reste réservé au monde des GPU et des moniteurs informatiques.",
        },
      ],
      [
        {
          en: "USB-C / Thunderbolt 4/5",
          fr: "USB-C / Thunderbolt 4/5",
        },
        {
          en: "The convergence connector. USB-C carries DisplayPort Alt Mode, enabling video output from the same oval connector used for charging and data. Thunderbolt 4 adds 40Gbps bidirectional bandwidth, eGPU support, and daisy-chaining up to 6 devices. Thunderbolt 5 (2024) reaches 120Gbps bidirectional. Essential for laptop users — a single USB-C cable can charge the laptop while driving a 4K monitor and a hub. The monitor itself can provide power to the laptop (up to 96W on USB-C PD 3.1).",
          fr: "L’USB-C est le connecteur de convergence par excellence. Il peut transporter le DisplayPort en mode alternatif, ce qui permet de faire passer la vidéo par le même connecteur ovale utilisé pour l’alimentation et les données. Thunderbolt 4 ajoute une bande passante bidirectionnelle de 40 Gbit/s, la prise en charge des eGPU et le chaînage de plusieurs périphériques, jusqu’à six dans certains cas. Thunderbolt 5, apparu en 2024, monte jusqu’à 120 Gbit/s bidirectionnels selon les usages. Pour les utilisateurs d’ordinateurs portables, ce connecteur est essentiel : un seul câble USB-C peut alimenter le laptop, piloter un écran 4K et connecter un hub en même temps. Certains moniteurs peuvent même recharger l’ordinateur directement via USB-C Power Delivery, jusqu’à 96 W ou plus selon la norme utilisée.",
        },
      ],
      [
        {
          en: "DVI (Digital Visual Interface)",
          fr: "DVI (Digital Visual Interface)",
        },
        {
          en: "Introduced in 1999 as the transition from analog VGA to digital. DVI-D (pure digital) carries uncompressed digital video. DVI-Dual Link supports up to 2560×1600 at 60Hz or 1920×1080 at 144Hz. No audio. Being removed from new GPUs and monitors — replaced by HDMI and DisplayPort. Still found on older monitors (pre-2015) and some projectors. Passive DVI-to-HDMI adapters work for digital signals.",
          fr: "Le DVI est introduit en 1999 pour accompagner la transition du VGA analogique vers la vidéo numérique. Le DVI-D, en version purement numérique, transporte une image non compressée. Le DVI Dual Link permet d’atteindre jusqu’à 2560×1600 à 60 Hz ou 1920×1080 à 144 Hz. Il ne transporte pas de son. Ce connecteur disparaît progressivement des nouveaux GPU et moniteurs, remplacé par le HDMI et le DisplayPort, mais on le retrouve encore sur des écrans plus anciens et sur certains projecteurs. Des adaptateurs passifs DVI vers HDMI fonctionnent pour les signaux numériques compatibles.",
        },
      ],
      [
        {
          en: "VGA (D-Sub 15-pin)",
          fr: "VGA (D-Sub 15 broches)",
        },
        {
          en: "Analog video standard introduced by IBM in 1987 with the PS/2. Transmits R, G, B as separate analog voltages plus horizontal and vertical sync signals. Maximum practical resolution ~2048×1536 at 85Hz before signal degradation becomes visible. Completely analog — any noise on the cable appears as visual artifacts. Officially deprecated by VESA in 2010. Still found on projectors, older monitors, industrial equipment, and KVM switches. Passive adapters to HDMI/DP cannot upscale quality — analog signal remains analog until the display converts it.",
          fr: "Le VGA est un standard vidéo analogique introduit par IBM en 1987 avec la gamme PS/2. Il transmet les composantes rouge, verte et bleue sous forme de tensions analogiques distinctes, ainsi que les signaux de synchronisation horizontale et verticale. Sa résolution pratique maximale tourne autour de 2048×1536 à 85 Hz avant que la dégradation du signal ne devienne visible. Comme tout est analogique, le moindre bruit sur le câble apparaît à l’écran sous forme d’artefacts. La VESA l’a officiellement déclaré obsolète en 2010, mais on le retrouve encore sur d’anciens projecteurs, moniteurs, équipements industriels ou commutateurs KVM. Un adaptateur passif vers HDMI ou DisplayPort n’améliore pas la qualité du signal : l’analogique reste analogique jusqu’à sa conversion par l’écran.",
        },
      ],
    ],
  },

  //CPU
  cpu: {
    name: {
      en: "CPU",
      fr: "CPU",
    },
    icon: "🧠",
    cat: {
      en: "Processing",
      fr: "Traitement",
    },
    tag: {
      en: "Fetch, decode, execute — billions of times per second",
      fr: "Chercher, décoder, exécuter — des milliards de fois par seconde",
    },
    ov: {
      en: `The Central Processing Unit is the primary computational engine of every computer. It executes the fundamental instruction cycle — Fetch, Decode, Execute, Write-back — at speeds measured in billions of cycles per second (GHz). Every program, every calculation, every decision made by software ultimately reduces to a sequence of these basic operations.

The fetch stage retrieves the next instruction from memory (ideally from the L1 instruction cache, a tiny but extremely fast SRAM buffer a few kilobytes in size). The decode stage parses the machine instruction binary encoding and determines what operation to perform and on which data. The execute stage passes the decoded operation to the appropriate execution unit — an ALU (Arithmetic Logic Unit) for integer math, an FPU (Floating Point Unit) for decimal math, or a SIMD unit for vector operations. The write-back stage stores the result to a register or cache.

Modern CPUs dramatically accelerate this cycle through pipelining — breaking the execution cycle into many discrete stages so multiple instructions can be in different stages simultaneously. A modern AMD Zen 5 or Intel Lion Cove core has a pipeline depth of ~20 stages, allowing up to 20 instructions to be in-flight simultaneously. Out-of-order execution goes further by dynamically reordering instructions to avoid pipeline stalls when a later instruction doesn't depend on the result of an earlier one.

Branch prediction is critical to pipeline efficiency. When the CPU encounters a conditional branch (if/else, loop), it must guess which path to take before evaluating the condition. Modern CPUs achieve >95% prediction accuracy through sophisticated machine-learning-based predictors. A misprediction flushes the pipeline and wastes ~15–20 cycles — the Spectre vulnerability exploited this exact mechanism.

The cache hierarchy reduces memory latency from ~70ns (DDR5 DRAM) to ~4ns (L3 cache) to ~1ns (L2 cache) to ~0.3ns (L1 cache). AMD's 3D V-Cache technology stacks an additional 64MB of L3 cache directly on top of the CPU die using TSV (Through-Silicon Via) interconnects, dramatically improving gaming performance by keeping frequently accessed game data in cache rather than sending it to slower DRAM.

Thermal management is critical — modern CPUs at boost frequencies draw 150–300W in a package the size of a postage stamp. The IHS (Integrated Heat Spreader) conducts heat from the die to the cooler. Between die and IHS is thermal interface material (TIM) — Intel solders high-end CPUs (much better conductivity), while some budget chips use thermal paste. Deliding (removing the IHS) and replacing the TIM can reduce temperatures by 20–30°C on some CPUs.`,
      fr: `Le Central Processing Unit, ou CPU, est le moteur de calcul principal de tout ordinateur. Il exécute le cycle fondamental d’instruction — lecture, décodage, exécution, écriture du résultat — à des vitesses mesurées en milliards de cycles par seconde, soit en gigahertz. Chaque programme, chaque calcul et chaque décision prise par un logiciel finit par se réduire à une suite de ces opérations élémentaires.

Lors de l’étape de lecture, le processeur récupère l’instruction suivante depuis la mémoire, idéalement depuis le cache d’instructions L1, un tampon SRAM minuscule mais extrêmement rapide. L’étape de décodage interprète l’encodage binaire de l’instruction machine pour déterminer l’opération à effectuer et les données concernées. L’étape d’exécution transmet ensuite cette opération à l’unité adaptée : une ALU (Arithmetic Logic Unit) pour les calculs entiers, une FPU (Floating Point Unit) pour les calculs en virgule flottante, ou encore une unité SIMD pour les opérations vectorielles. Enfin, l’étape d’écriture enregistre le résultat dans un registre ou dans un cache.

Les CPU modernes accélèrent massivement ce cycle grâce au pipeline, qui découpe l’exécution en de nombreuses étapes distinctes afin que plusieurs instructions puissent être traitées en parallèle à différents stades. Un cœur moderne comme un AMD Zen 5 ou un Intel Lion Cove possède un pipeline d’environ vingt étages, ce qui permet de garder jusqu’à une vingtaine d’instructions en vol simultanément. L’exécution out-of-order va encore plus loin en réorganisant dynamiquement les instructions pour éviter les blocages du pipeline lorsqu’une instruction ultérieure n’a pas besoin du résultat d’une précédente.

La prédiction de branchement est essentielle pour l’efficacité du pipeline. Lorsqu’un CPU rencontre une branche conditionnelle — un if/else ou une boucle — il doit deviner quel chemin sera pris avant même de connaître le résultat exact de la condition. Les processeurs modernes atteignent plus de 95 % de précision grâce à des prédicteurs très sophistiqués, parfois proches d’approches de type apprentissage statistique. Une mauvaise prédiction vide le pipeline et gaspille environ 15 à 20 cycles ; la vulnérabilité Spectre exploitait précisément ce comportement.

La hiérarchie des caches permet de réduire énormément la latence mémoire : on passe d’environ 70 ns pour la DRAM DDR5 à environ 4 ns pour le cache L3, 1 ns pour le cache L2 et 0,3 ns pour le cache L1. La technologie 3D V-Cache d’AMD ajoute par empilement environ 64 Mo supplémentaires de cache L3 directement au-dessus du die du processeur grâce à des interconnexions TSV (Through-Silicon Via). Cela améliore fortement les performances en jeu en gardant davantage de données critiques dans le cache au lieu de les renvoyer vers une DRAM bien plus lente.

La gestion thermique est un enjeu majeur : à leurs fréquences boost, les CPU modernes peuvent consommer entre 150 et 300 W dans un boîtier à peine plus grand qu’un timbre-poste. L’IHS (Integrated Heat Spreader) transmet la chaleur du die vers le système de refroidissement. Entre le die et l’IHS se trouve le matériau d’interface thermique, ou TIM : Intel brase ses puces haut de gamme, ce qui conduit mieux la chaleur, tandis que certains modèles plus abordables utilisent une pâte thermique. Le delid — qui consiste à retirer l’IHS pour remplacer le TIM — peut parfois faire baisser les températures de 20 à 30 °C.`,
    },

    hist: [
      [
        "1947",
        {
          en: "Bell Labs invents the transistor — the fundamental building block that makes integrated circuits and CPUs possible",
          fr: "Les Bell Labs inventent le transistor — le composant fondamental qui rend possibles les circuits intégrés et les CPU.",
        },
      ],
      [
        "1958",
        {
          en: "Jack Kilby at Texas Instruments creates the first integrated circuit — multiple transistors on a single germanium substrate",
          fr: "Jack Kilby, chez Texas Instruments, crée le premier circuit intégré — plusieurs transistors réunis sur un même substrat de germanium.",
        },
      ],
      [
        "1965",
        {
          en: `Gordon Moore observes that transistor density doubles approximately every two years — "Moore's Law" drives CPU development for 60 years`,
          fr: `Gordon Moore observe que la densité de transistors double environ tous les deux ans — la « loi de Moore » guidera l’évolution des CPU pendant près de soixante ans.`,
        },
      ],
      [
        "1971",
        {
          en: "Intel 4004: first commercial microprocessor. 4-bit, 2,300 transistors, 10μm process, 740kHz clock. Designed for a calculator",
          fr: "L’Intel 4004 devient le premier microprocesseur commercial. Il est 4 bits, contient 2 300 transistors, est gravé en 10 μm et tourne à 740 kHz. Il est conçu à l’origine pour une calculatrice.",
        },
      ],
      [
        "1974",
        {
          en: "Intel 8080: 8-bit CPU that powers the Altair 8800 — the first personal computer kit. 6,000 transistors",
          fr: "L’Intel 8080, processeur 8 bits de 6 000 transistors, équipe l’Altair 8800 — l’un des premiers kits d’ordinateur personnel emblématiques.",
        },
      ],
      [
        "1978",
        {
          en: "Intel 8086: 16-bit CPU establishing the x86 instruction set architecture — every x86 CPU in use today is backward-compatible with the 8086",
          fr: "L’Intel 8086, processeur 16 bits, pose les bases de l’architecture d’instructions x86 — et tous les CPU x86 actuels restent rétrocompatibles avec cet héritage.",
        },
      ],
      [
        "1982",
        {
          en: "Intel 80286: first x86 CPU with protected mode, enabling memory isolation between processes — foundation of modern multitasking OS",
          fr: "L’Intel 80286 est le premier CPU x86 à introduire le mode protégé, permettant l’isolation mémoire entre processus — une base essentielle des systèmes multitâches modernes.",
        },
      ],
      [
        "1985",
        {
          en: "Intel 80386: first 32-bit x86 CPU, 275,000 transistors — enables 4GB address space and becomes foundation of modern PC software",
          fr: "L’Intel 80386 devient le premier CPU x86 32 bits, avec 275 000 transistors — il ouvre l’accès à un espace d’adressage de 4 Go et sert de fondation aux logiciels PC modernes.",
        },
      ],
      [
        "1989",
        {
          en: "Intel 80486: integrates math coprocessor (FPU) on-die for the first time — 1.2 million transistors, 50MHz",
          fr: "L’Intel 80486 intègre pour la première fois le coprocesseur mathématique (FPU) directement dans le die — avec 1,2 million de transistors et une fréquence de 50 MHz.",
        },
      ],
      [
        "1993",
        {
          en: "Intel Pentium: 3.1 million transistors, superscalar (two execution pipelines) — marks the transition to the modern era",
          fr: "L’Intel Pentium, avec 3,1 millions de transistors et une architecture superscalaire à deux pipelines d’exécution, marque l’entrée dans l’ère moderne des processeurs.",
        },
      ],
      [
        "1999",
        {
          en: "AMD Athlon (K7): first CPU to exceed 1GHz, beats Intel to market, introduces the Slot A form factor",
          fr: "L’AMD Athlon (K7) devient le premier CPU à dépasser 1 GHz, devançant Intel sur ce terrain et introduisant le format Slot A.",
        },
      ],
      [
        "2000",
        {
          en: "Intel Pentium 4 (Netburst): 20-stage pipeline for high clock speeds backfires — poor IPC, high power consumption",
          fr: "L’Intel Pentium 4 basé sur Netburst adopte un pipeline de 20 étages pour viser de très hautes fréquences, mais cela se retourne contre lui avec un IPC faible et une forte consommation.",
        },
      ],
      [
        "2003",
        {
          en: "AMD Athlon 64: first 64-bit consumer CPU, extending addressable memory beyond 4GB — AMD64 architecture adopted by Intel as EM64T",
          fr: "L’AMD Athlon 64 devient le premier CPU grand public 64 bits, étendant la mémoire adressable au-delà de 4 Go — l’architecture AMD64 sera ensuite reprise par Intel sous le nom EM64T.",
        },
      ],
      [
        "2006",
        {
          en: "Intel Core 2 Duo: multi-core goes mainstream at consumer prices — two full cores sharing one die, resets the performance landscape",
          fr: "L’Intel Core 2 Duo fait entrer le multicœur dans le grand public à prix accessible — deux cœurs complets sur un même die, ce qui redéfinit le paysage des performances.",
        },
      ],
      [
        "2011",
        {
          en: "Intel Sandy Bridge: memory controller and GPU fully integrated on-die — the modern SoC-like CPU architecture emerges",
          fr: "Avec Intel Sandy Bridge, le contrôleur mémoire et le GPU sont pleinement intégrés au die — une étape majeure vers des CPU au fonctionnement proche d’un SoC moderne.",
        },
      ],
      [
        "2017",
        {
          en: "AMD Ryzen (Zen): AMD returns to performance leadership with 8 cores for $329 — ends Intel's 7-year dominance",
          fr: "Avec Ryzen basé sur Zen, AMD revient au premier plan des performances en proposant 8 cœurs pour 329 dollars — mettant fin à plusieurs années de domination d’Intel.",
        },
      ],
      [
        "2019",
        {
          en: "AMD Ryzen 3000 (Zen 2): chiplet design separates compute die from I/O die — enables different process nodes for different functions",
          fr: "Les AMD Ryzen 3000 (Zen 2) popularisent l’architecture en chiplets, séparant les dies de calcul du die d’I/O — ce qui permet d’utiliser différents nœuds de gravure selon la fonction.",
        },
      ],
      [
        "2020",
        {
          en: "Apple M1: ARM64 CPU with unified memory architecture and Neural Engine — reshapes laptop performance-per-watt permanently",
          fr: "L’Apple M1, CPU ARM64 avec mémoire unifiée et Neural Engine, transforme durablement le rapport performance par watt dans les ordinateurs portables.",
        },
      ],
      [
        "2022",
        {
          en: "AMD Ryzen 7000X3D (Zen 4 + 3D V-Cache): stacked L3 cache delivers 30–40% gaming performance uplift over equivalent non-V-Cache CPU",
          fr: "Les AMD Ryzen 7000X3D combinent Zen 4 et 3D V-Cache — le cache L3 empilé peut offrir 30 à 40 % de performances supplémentaires en jeu par rapport à un CPU équivalent sans V-Cache.",
        },
      ],
      [
        "2024",
        {
          en: "Intel Core Ultra 200 (Arrow Lake) and AMD Ryzen 9000 (Zen 5): 24+ cores, on-die AI accelerators (NPU), and LPDDR5X support become mainstream",
          fr: "Avec les Intel Core Ultra 200 (Arrow Lake) et les AMD Ryzen 9000 (Zen 5), les CPU à plus de 24 cœurs, les accélérateurs IA intégrés (NPU) et la prise en charge de la LPDDR5X deviennent courants.",
        },
      ],
    ],

    types: [
      [
        {
          en: "Desktop CPU (LGA/AM5)",
          fr: "CPU de bureau (LGA/AM5)",
        },
        {
          en: "High TDP (65–253W), unlocked multiplier on K/X variants for overclocking. Full cache complement, maximum core counts. Socketed — user-replaceable. AMD Ryzen 9 7950X: 16 cores / 32 threads, 5.7GHz boost, 170W TDP, $699. Intel Core i9-14900K: 24 cores (8P+16E), 6.0GHz boost, 253W TDP, $589. Requires separate cooling solution and motherboard. Platform longevity varies: AMD AM5 committed to 2027+, Intel changes sockets every 2 generations.",
          fr: "Les CPU de bureau affichent généralement un TDP élevé, de 65 à plus de 250 W, avec un multiplicateur débloqué sur certaines variantes K ou X pour l’overclocking. Ils disposent de la totalité de leur cache et des nombres de cœurs les plus élevés de leur gamme. Ils sont montés sur socket, donc remplaçables par l’utilisateur. Par exemple, un AMD Ryzen 9 7950X propose 16 cœurs et 32 threads avec un boost à 5,7 GHz, tandis qu’un Intel Core i9-14900K monte à 24 cœurs hybrides avec un boost à 6,0 GHz. Ils nécessitent une carte mère adaptée et un système de refroidissement séparé. La longévité de la plateforme varie : AMD a promis plusieurs générations sur AM5, alors qu’Intel change plus souvent de socket.",
        },
      ],
      [
        {
          en: "Mobile CPU (laptop)",
          fr: "CPU mobile (ordinateur portable)",
        },
        {
          en: "TDP ranges from 9W (U-series fanless) to 55W (HX-series). Soldered BGA package — not user-replaceable. Intel Core Ultra series and AMD Ryzen AI series integrate NPU (Neural Processing Unit) for AI acceleration. Mobile CPUs share thermal budget with mobile GPU — performance varies significantly based on cooling system quality. AMD Ryzen AI 9 HX 370: 12 cores, 5.1GHz boost, 54W, excellent performance-per-watt.",
          fr: "Les CPU mobiles ont un TDP allant d’environ 9 W pour les séries très économes jusqu’à 55 W ou plus pour les modèles HX destinés aux machines puissantes. Ils sont généralement soudés au format BGA et ne sont donc pas remplaçables par l’utilisateur. Les gammes récentes, comme Intel Core Ultra ou AMD Ryzen AI, intègrent aussi un NPU (Neural Processing Unit) pour accélérer certaines tâches d’IA. Dans un ordinateur portable, le CPU partage souvent le budget thermique avec le GPU, ce qui fait que les performances réelles varient énormément selon la qualité du refroidissement. Le rapport performance par watt y est souvent un critère plus important que la puissance brute.",
        },
      ],
      [
        {
          en: "HEDT (High-End Desktop)",
          fr: "HEDT (High-End Desktop)",
        },
        {
          en: "Extreme core counts (16–64 cores) for professional workstation workloads. AMD Threadripper 7980X: 64 cores / 128 threads, massive cache, quad-channel DDR5. Intel Xeon W series equivalent. Support ECC memory, PCIe 5.0 with many lanes (128+), and multiple M.2 slots directly from CPU. Very high TDP (350W+). Requires workstation motherboards costing $500–1000+. Target users: 3D rendering, video editing, scientific simulation, software compilation.",
          fr: "Les plateformes HEDT visent les stations de travail haut de gamme avec des nombres de cœurs extrêmes, souvent de 16 à 64 cœurs, pour des charges professionnelles lourdes. Un AMD Threadripper 7980X, par exemple, propose 64 cœurs et 128 threads, un énorme volume de cache et un contrôleur mémoire DDR5 en quad-channel. Les équivalents Intel se trouvent dans certaines gammes Xeon W. Ces plateformes prennent en charge la mémoire ECC, un très grand nombre de lignes PCIe 5.0 et plusieurs slots M.2 reliés directement au CPU. Leur TDP peut dépasser 350 W et elles nécessitent des cartes mères de station de travail coûteuses. Elles s’adressent au rendu 3D, au montage vidéo intensif, à la simulation scientifique ou à la compilation de gros projets logiciels.",
        },
      ],
      [
        {
          en: "Server CPU",
          fr: "CPU serveur",
        },
        {
          en: "AMD EPYC Genoa: up to 96 cores per socket, 12-channel DDR5, 128 PCIe 5.0 lanes, ECC mandatory. Intel Xeon Scalable Sapphire Rapids: 60 cores, 8-channel DDR5, HBM variants available. Designed for 24/7 operation, hot spare memory, remote management (IPMI/BMC), RAS (Reliability, Availability, Serviceability) features. Single-threaded performance often lower than desktop CPUs because power efficiency and reliability are prioritized over peak boost clocks.",
          fr: "Les CPU serveurs sont conçus pour fonctionner 24 h/24 et 7 j/7 dans des environnements critiques. Des modèles comme les AMD EPYC Genoa peuvent monter jusqu’à 96 cœurs par socket avec 12 canaux DDR5 et 128 lignes PCIe 5.0, tandis que certains Intel Xeon Scalable offrent eux aussi de très fortes capacités mémoire et I/O. La mémoire ECC y est indispensable, tout comme les fonctions avancées de fiabilité, de disponibilité et de maintenance (RAS), la gestion à distance via IPMI ou BMC, ou encore des mécanismes de secours matériel. Les performances en simple thread y sont souvent moins agressives que sur les CPU desktop, car la priorité est donnée à la stabilité, à l’efficacité énergétique et à la densité de calcul.",
        },
      ],
      [
        {
          en: "ARM CPU",
          fr: "CPU ARM",
        },
        {
          en: "RISC instruction set with fixed-length instructions — simpler decode, better power efficiency than x86 CISC. Apple M-series leads performance-per-watt benchmarks in laptops and desktops. M4 Max: 14 cores (4P + 10E), 4.4GHz, 120W, 273GB/s memory bandwidth. Qualcomm Snapdragon X Elite: 12 Oryon cores, comparable performance. Growing ecosystem for Windows on ARM but x86 compatibility layer (Rosetta 2 on macOS, Prism on Windows) incurs ~10–20% overhead on non-native apps.",
          fr: "Les CPU ARM reposent sur une architecture de type RISC avec des instructions de longueur fixe, ce qui simplifie le décodage et améliore souvent l’efficacité énergétique par rapport au x86 de tradition CISC. Les puces Apple de série M dominent aujourd’hui les comparatifs de performance par watt sur portable et même sur certains desktops. D’autres acteurs, comme Qualcomm avec Snapdragon X Elite, poussent également cette architecture sur Windows. L’écosystème progresse rapidement, mais l’exécution d’applications x86 via une couche de compatibilité — comme Rosetta 2 sur macOS ou Prism sur Windows — entraîne encore un certain surcoût sur les logiciels non natifs.",
        },
      ],
      [
        {
          en: "SoC (System on Chip)",
          fr: "SoC (System on Chip)",
        },
        {
          en: "CPU + GPU + memory controller + I/O + NPU integrated on a single die or package. Apple M4: CPU, GPU, Neural Engine, Media Engine, secure enclave, and LPDDR5X memory controller unified. The unified memory architecture means CPU and GPU share the same physical memory pool with no bandwidth penalty for data sharing. Impossible to upgrade any component. Dominant in mobile (Snapdragon, A18 Pro), growing in laptops and desktops. Power efficiency advantage: 40–60% less power than equivalent component approach.",
          fr: "Un SoC regroupe sur un même die ou un même package le CPU, le GPU, le contrôleur mémoire, les interfaces d’entrée/sortie et parfois un NPU. Des puces comme l’Apple M4 intègrent aussi un Neural Engine, un Media Engine et d’autres blocs spécialisés dans un ensemble unifié. L’architecture de mémoire unifiée signifie que le CPU et le GPU partagent le même pool de mémoire physique, ce qui évite les copies coûteuses entre composants séparés. En contrepartie, pratiquement rien n’est évolutif ou remplaçable. Les SoC dominent déjà le mobile et prennent de plus en plus de place dans les ordinateurs portables et même certains desktops, grâce à leur très forte efficacité énergétique.",
        },
      ],
    ],

    conn: [
      [
        {
          en: "LGA socket (Intel)",
          fr: "Socket LGA (Intel)",
        },
        {
          en: "Land Grid Array: the socket on the motherboard contains the pins; the CPU bottom has flat gold contact pads. The ZIF (Zero Insertion Force) lever clamps the CPU down, pressing 1700+ contacts against the pads simultaneously. LGA1700 supports Intel 12th–14th gen (Alder/Raptor Lake). LGA1851 supports Intel Core Ultra 200 (Arrow Lake). The socket frame, ILM (Independent Loading Mechanism), and backplate together apply the precise clamping force needed without cracking the die.",
          fr: "Dans un socket LGA (Land Grid Array), les broches se trouvent sur la carte mère, tandis que le dessous du CPU présente uniquement des pastilles de contact plates dorées. Le levier ZIF (Zero Insertion Force) plaque le processeur contre ces contacts en une seule opération. Des sockets comme le LGA1700 ont servi aux générations Intel récentes, tandis que d’autres comme le LGA1851 prennent le relais sur des gammes plus nouvelles. Le cadre du socket, le mécanisme de maintien et la plaque arrière appliquent une pression très précise pour garantir un bon contact électrique sans endommager le die.",
        },
      ],
      [
        {
          en: "AM5 socket (AMD)",
          fr: "Socket AM5 (AMD)",
        },
        {
          en: "Pin Grid Array variant: 1718 pins on the CPU that insert into corresponding holes in the socket. The lever mechanism locks the CPU in place. AM5 supports AMD Ryzen 7000 and 9000 series. Requires DDR5 — no DDR4 support. AMD committed to AM5 platform support through at least 2027, meaning current AM5 motherboards will accept future Ryzen generations. Compatible with AM4 coolers via adapter brackets.",
          fr: "Le socket AM5 d’AMD représente la génération moderne de sa plateforme desktop. Il prend en charge les Ryzen 7000 et 9000 et impose l’usage de la DDR5, sans compatibilité DDR4. AMD a annoncé un support de plateforme sur plusieurs années, ce qui laisse espérer la compatibilité de futures générations sur les cartes mères AM5 actuelles. Selon les solutions de refroidissement, certains ventirads AM4 restent compatibles via des systèmes de fixation adaptés. Le socket et son mécanisme de verrouillage garantissent un positionnement précis du CPU sur la carte mère.",
        },
      ],
      [
        {
          en: "PCIe interface (GPU/NVMe)",
          fr: "Interface PCIe (GPU/NVMe)",
        },
        {
          en: "Peripheral Component Interconnect Express: a point-to-point serial interface. The CPU contains a PCIe controller with a pool of lanes. PCIe 5.0: 4 GB/s per lane bidirectional. A PCIe x16 slot at Gen 5 provides 128 GB/s total bandwidth. Primary NVMe SSD uses PCIe x4 = 32 GB/s from the CPU controller. The GPU uses the x16 slot. PCIe is backward and forward compatible — a PCIe 3.0 GPU works in a PCIe 5.0 slot at 3.0 speeds.",
          fr: "Le PCI Express est une interface série point à point. Le CPU embarque un contrôleur PCIe qui distribue un certain nombre de lignes vers les différents périphériques. En PCIe 5.0, chaque ligne offre environ 4 Go/s bidirectionnels ; un slot x16 en Gen 5 peut donc fournir une bande passante totale très élevée. Les GPU utilisent généralement ce slot x16, tandis qu’un SSD NVMe principal fonctionne le plus souvent en x4. Le PCIe reste rétrocompatible et intercompatible entre générations : un périphérique PCIe plus ancien fonctionne dans un slot plus récent, simplement à la vitesse supportée par le maillon le plus lent.",
        },
      ],
      [
        {
          en: "Memory controller / DDR5",
          fr: "Contrôleur mémoire / DDR5",
        },
        {
          en: "The Integrated Memory Controller (IMC) is fabricated directly on the CPU die, replacing the separate North Bridge chip eliminated in 2011. For DDR5: dual 32-bit channels per stick = 64-bit total per DIMM. Two DIMMs in dual-channel = 128-bit bus width = 96.0 GB/s peak bandwidth at DDR5-6000. The IMC quality determines the maximum stable memory frequency — better silicon bins achieve DDR5-8000+ with tight timings. AMD CPUs use the Infinity Fabric as an additional interconnect between CCD (compute) and IOD (I/O) dies.",
          fr: "Le contrôleur mémoire intégré, ou IMC, se trouve directement sur le die du CPU et remplace depuis longtemps les anciens North Bridges séparés. Avec la DDR5, chaque barrette est organisée en deux sous-canaux de 32 bits, soit 64 bits au total par DIMM. En double canal, cela double encore la largeur de bus et permet d’atteindre une bande passante mémoire très élevée. La qualité de l’IMC influence directement la fréquence mémoire stable que le CPU peut tenir : les meilleurs exemplaires peuvent monter très haut avec des timings serrés. Chez AMD, l’Infinity Fabric joue aussi un rôle important dans la communication entre les dies de calcul et le die d’I/O.",
        },
      ],
      [
        {
          en: "DMI link (CPU ↔ PCH)",
          fr: "Lien DMI (CPU ↔ PCH)",
        },
        {
          en: "Direct Media Interface: the proprietary high-speed serial bus connecting the CPU to the PCH (Platform Controller Hub). Carries all USB, SATA, audio, secondary PCIe, and M.2 traffic that is not directly connected to the CPU. DMI 4.0 (Intel 12th gen+) provides 16 GB/s total bandwidth — shared between all PCH-attached devices simultaneously. This is a potential bottleneck when using multiple USB 3.2 Gen 2×2 devices and high-speed NVMe simultaneously.",
          fr: "Le DMI (Direct Media Interface) est un bus série haut débit propriétaire qui relie le CPU au PCH (Platform Controller Hub). Il transporte les flux USB, SATA, audio, PCIe secondaires et parfois M.2 qui ne sont pas connectés directement au processeur. Toute cette bande passante est partagée entre les périphériques rattachés au chipset. Dans certains cas, cela peut devenir un goulot d’étranglement, par exemple lorsqu’on utilise en même temps plusieurs périphériques USB très rapides et des SSD NVMe reliés au PCH.",
        },
      ],
    ],
  },

  //GPU
  gpu: {
    name: {
      en: "GPU",
      fr: "GPU",
    },
    icon: "🎮",
    cat: {
      en: "Processing",
      fr: "Traitement",
    },
    tag: {
      en: "Thousands of small cores — built for parallel work",
      fr: "Des milliers de petits cœurs — conçus pour le travail parallèle",
    },
    ov: {
      en: `The Graphics Processing Unit is a massively parallel processor that excels at performing the same operation on thousands of data points simultaneously. Originally designed exclusively for 3D rendering, the GPU has become the primary accelerator for artificial intelligence, scientific simulation, video encoding, and cryptocurrency mining.

The fundamental architectural difference between CPU and GPU reflects their respective design goals. A CPU is optimized for sequential, low-latency execution of complex, branchy code — it dedicates most of its die area to branch prediction, out-of-order execution logic, and large caches. A modern CPU has 8–24 powerful cores. A GPU is optimized for throughput on regular, predictable workloads — it dedicates most of its die area to thousands of simple arithmetic units (CUDA cores, Stream Processors) arranged in a hierarchy: cores → Warps/Waves → Compute Units → GPCs.

The 3D rendering pipeline begins in the application (game or engine) which generates draw calls containing geometry (triangles defined by vertex positions) and shader programs. The GPU vertex shader transforms 3D world-space coordinates into 2D screen-space coordinates for each vertex. The rasterizer converts the 2D triangles into fragments (candidate pixels). The pixel shader calculates the final color of each fragment based on lighting, textures, and material properties. The output merger combines overlapping fragments (depth testing, alpha blending) and writes the final image to the VRAM framebuffer. This framebuffer is then scanned out to the display via HDMI or DisplayPort at the refresh rate.

Ray tracing replaces or supplements rasterization's approximations of lighting with physically accurate light simulation. Each ray is traced from the virtual camera through each pixel, bouncing off surfaces and accumulating lighting contributions. This accurately simulates reflections, refractions, global illumination, and ambient occlusion. The computational cost is 10–100× higher than rasterization for equivalent image quality, making dedicated RT cores (NVIDIA) and ray accelerators (AMD) essential for playable framerates.

VRAM (Video RAM) is the GPU's dedicated memory pool. All textures, framebuffers, shader programs, and geometry data must fit in VRAM for optimal performance. When VRAM is exhausted, the GPU begins using system RAM over the PCIe bus — bandwidth drops from 1000+ GB/s (GDDR6X) to 64 GB/s (PCIe 5.0 x16), causing massive stuttering. 4K gaming with high-resolution texture packs easily requires 12–16GB VRAM. AI image generation models (Stable Diffusion, ComfyUI) require 8–24GB depending on model size.`,
      fr: `Le Graphics Processing Unit, ou GPU, est un processeur massivement parallèle, extrêmement efficace lorsqu’il s’agit d’exécuter la même opération sur des milliers de données en même temps. À l’origine conçu presque exclusivement pour le rendu 3D, le GPU est devenu un accélérateur central pour l’intelligence artificielle, la simulation scientifique, l’encodage vidéo et même, à certaines périodes, le minage de cryptomonnaies.

La différence architecturale fondamentale entre un CPU et un GPU reflète leurs objectifs respectifs. Un CPU est optimisé pour l’exécution séquentielle et à faible latence de code complexe, irrégulier et riche en branchements — il consacre donc une grande partie de sa surface à la prédiction de branchement, à l’exécution out-of-order et à de gros caches. Un CPU moderne possède généralement entre 8 et 24 cœurs puissants. Un GPU, au contraire, est optimisé pour le débit sur des charges régulières et prévisibles : il consacre l’essentiel de sa surface à des milliers d’unités arithmétiques plus simples (CUDA cores, Stream Processors), organisées hiérarchiquement en groupes de calcul.

Le pipeline de rendu 3D commence dans l’application — jeu vidéo ou moteur graphique — qui génère des draw calls contenant de la géométrie, souvent des triangles définis par leurs sommets, ainsi que des programmes de shaders. Le vertex shader du GPU transforme les coordonnées 3D de l’espace du monde en coordonnées 2D projetées à l’écran. Le rasterizer convertit ensuite ces triangles en fragments, c’est-à-dire en candidats pixels. Le pixel shader calcule la couleur finale de chaque fragment selon l’éclairage, les textures et les matériaux. Enfin, l’unité de sortie fusionne les fragments qui se recouvrent, applique les tests de profondeur et le blending, puis écrit l’image finale dans le framebuffer stocké en VRAM. Cette image est ensuite envoyée vers l’écran via HDMI ou DisplayPort au rythme du rafraîchissement.

Le ray tracing remplace, ou complète, les approximations classiques de la rasterisation par une simulation plus fidèle du comportement de la lumière. Des rayons sont lancés depuis la caméra virtuelle à travers chaque pixel, rebondissent sur les surfaces et accumulent des contributions lumineuses. Cela permet de simuler avec beaucoup plus de précision les reflets, les réfractions, l’illumination globale ou l’occlusion ambiante. Le coût de calcul est toutefois énorme — souvent de 10 à 100 fois supérieur à celui d’un rendu rasterisé équivalent — d’où l’importance de blocs matériels spécialisés comme les RT Cores de NVIDIA ou les accélérateurs de ray tracing d’AMD.

La VRAM (Video RAM) constitue la mémoire dédiée du GPU. Toutes les textures, les framebuffers, les shaders et les données géométriques doivent y tenir pour obtenir de bonnes performances. Lorsque la VRAM est saturée, le GPU commence à utiliser la mémoire système via le bus PCIe — et la bande passante chute alors brutalement, passant de plus de 1000 Go/s avec de la GDDR6X à quelques dizaines de Go/s via PCIe, ce qui provoque des saccades massives. Le jeu en 4K avec textures haute définition nécessite facilement 12 à 16 Go de VRAM. Les modèles de génération d’images par IA, comme Stable Diffusion ou ComfyUI, demandent quant à eux entre 8 et 24 Go selon leur taille et leur complexité.`,
    },

    hist: [
      [
        "1981",
        {
          en: "IBM ships the first graphics card with the IBM PC — the MDA (Monochrome Display Adapter), text only, no graphics",
          fr: "IBM livre la première carte graphique avec l’IBM PC — la MDA (Monochrome Display Adapter), limitée au texte et sans véritable prise en charge graphique.",
        },
      ],
      [
        "1984",
        {
          en: "IBM EGA (Enhanced Graphics Adapter) — 640×350, 16 colors. The first card with a dedicated video RAM buffer",
          fr: "L’IBM EGA (Enhanced Graphics Adapter) apporte le 640×350 en 16 couleurs et devient l’une des premières cartes à intégrer une mémoire vidéo dédiée.",
        },
      ],
      [
        "1987",
        {
          en: "IBM VGA: 640×480, 256 colors from 262,144 — analog output, became the global standard for a decade",
          fr: "Le standard VGA d’IBM propose le 640×480 et 256 couleurs parmi 262 144 possibles — sa sortie analogique devient une référence mondiale pendant près d’une décennie.",
        },
      ],
      [
        "1991",
        {
          en: "S3 Graphics 86C911 — first single-chip 2D graphics accelerator, offloading BitBlt operations from the CPU",
          fr: "Le S3 Graphics 86C911 s’impose comme l’un des premiers accélérateurs graphiques 2D sur une seule puce, déchargeant le CPU des opérations de type BitBlt.",
        },
      ],
      [
        "1995",
        {
          en: "3dfx Voodoo 1: first 3D-only accelerator card — required a separate 2D card via pass-through cable. Transforms PC gaming permanently",
          fr: "La 3dfx Voodoo 1 devient l’une des premières cartes d’accélération 3D dédiées — elle nécessite encore une carte 2D séparée et un câble pass-through, mais transforme durablement le jeu sur PC.",
        },
      ],
      [
        "1997",
        {
          en: "3dfx Voodoo 2: first card to support Scan-Line Interleave (SLI) — two cards combined for doubled performance",
          fr: "La 3dfx Voodoo 2 popularise le Scan-Line Interleave (SLI), permettant de combiner deux cartes pour augmenter fortement les performances.",
        },
      ],
      [
        "1999",
        {
          en: "NVIDIA GeForce 256: first consumer GPU (coined the term). Adds hardware Transform & Lighting, removing CPU bottleneck from 3D rendering. 50 million polygons/second",
          fr: "La NVIDIA GeForce 256 est présentée comme le premier GPU grand public — le terme est alors popularisé. Elle ajoute un moteur matériel de Transform & Lighting, supprimant une partie importante de la charge 3D du CPU.",
        },
      ],
      [
        "2000",
        {
          en: "NVIDIA GeForce 2 GTS: first GPU with fully programmable vertex shaders — games begin writing custom rendering code for hardware execution",
          fr: "La NVIDIA GeForce 2 GTS marque une étape importante avec des capacités de traitement graphique plus programmables, ouvrant la voie à des pipelines de rendu de plus en plus personnalisés.",
        },
      ],
      [
        "2001",
        {
          en: "NVIDIA GeForce 3: DirectX 8 programmable shader model 1.1 — pixel shaders enable per-pixel lighting for the first time",
          fr: "La NVIDIA GeForce 3 introduit DirectX 8 et les premiers pixel shaders programmables, rendant possible l’éclairage calculé pixel par pixel sur du matériel grand public.",
        },
      ],
      [
        "2002",
        {
          en: "ATI Radeon 9700 Pro: first DirectX 9 GPU, AGP 8x, 256-bit memory bus — beats NVIDIA for 18 months",
          fr: "L’ATI Radeon 9700 Pro devient la première grande carte DirectX 9 grand public, avec bus mémoire 256 bits et AGP 8x, dominant NVIDIA pendant un bon moment.",
        },
      ],
      [
        "2006",
        {
          en: "NVIDIA GeForce 8800 GTX: first DirectX 10 unified shader architecture — 128 stream processors sharing a unified shader pool. Still powerful enough to play Crysis",
          fr: "La NVIDIA GeForce 8800 GTX popularise l’architecture à shaders unifiés sous DirectX 10, avec 128 processeurs de flux partageant un même pool de calcul.",
        },
      ],
      [
        "2007",
        {
          en: "NVIDIA Tesla C870: first GPU designed specifically for scientific compute — no display outputs, pure GPGPU",
          fr: "La NVIDIA Tesla C870 est l’une des premières cartes pensées spécifiquement pour le calcul scientifique et le GPGPU, sans sortie vidéo destinée à l’affichage.",
        },
      ],
      [
        "2008",
        {
          en: "NVIDIA CUDA SDK 1.0 released publicly — GPU computing opens to researchers and developers worldwide",
          fr: "La sortie publique du SDK CUDA 1.0 ouvre largement le calcul sur GPU aux chercheurs et aux développeurs du monde entier.",
        },
      ],
      [
        "2010",
        {
          en: "NVIDIA Fermi (GTX 480): first GPU with L1/L2 cache hierarchy and ECC memory — designed for both gaming and GPGPU",
          fr: "L’architecture NVIDIA Fermi, illustrée par la GTX 480, introduit notamment une hiérarchie de caches L1/L2 plus avancée et des capacités mieux adaptées au calcul général sur GPU.",
        },
      ],
      [
        "2012",
        {
          en: "NVIDIA Kepler: CUDA cores double, efficiency improves dramatically — GTX 680 beats AMD at half the power",
          fr: "Avec Kepler, NVIDIA améliore fortement l’efficacité énergétique de ses GPU et augmente massivement la capacité de calcul parallèle de sa gamme.",
        },
      ],
      [
        "2014",
        {
          en: "AMD Mantle API: low-level GPU access reduces driver overhead. Leads directly to DirectX 12 and Vulkan",
          fr: "L’API AMD Mantle propose un accès bas niveau au GPU et réduit fortement l’overhead des pilotes — elle influencera directement DirectX 12 et Vulkan.",
        },
      ],
      [
        "2016",
        {
          en: "NVIDIA Pascal (GTX 1080): 16nm FinFET, HBM2 on GP100 — GPGPU performance 10× previous generation. Deep learning takes off",
          fr: "L’architecture Pascal de NVIDIA améliore fortement les performances et l’efficacité, contribuant à l’explosion des usages liés au deep learning et au calcul accéléré.",
        },
      ],
      [
        "2018",
        {
          en: "NVIDIA Turing (RTX 2080): first consumer GPU with dedicated RT cores for real-time ray tracing and Tensor cores for DLSS",
          fr: "Avec Turing et les RTX 20, NVIDIA introduit pour le grand public des RT Cores dédiés au ray tracing temps réel et des Tensor Cores utilisés notamment pour le DLSS.",
        },
      ],
      [
        "2020",
        {
          en: "NVIDIA Ampere (RTX 3090): 24GB GDDR6X, 10,496 CUDA cores — enables large AI model inference on consumer hardware",
          fr: "L’architecture Ampere, illustrée par la RTX 3090, apporte 24 Go de GDDR6X et une énorme capacité de calcul, rendant certains usages IA avancés possibles sur du matériel grand public.",
        },
      ],
      [
        "2022",
        {
          en: "NVIDIA Ada Lovelace (RTX 4090): DLSS 3 Frame Generation, 4th-gen Tensor cores, 5nm TSMC — 82 teraflops FP32",
          fr: "L’architecture Ada Lovelace, avec la RTX 4090, pousse encore plus loin les performances raster, ray tracing et IA, notamment avec la génération d’images via DLSS 3.",
        },
      ],
      [
        "2024",
        {
          en: "NVIDIA Blackwell (RTX 5090): 92 billion transistors, GDDR7 memory, 5th-gen Tensor cores — designed for AI inference at 4K gaming scale",
          fr: "La génération Blackwell de NVIDIA met l’accent sur des GPU toujours plus massifs, avec mémoire GDDR7 et accélération IA renforcée, visant à la fois le jeu 4K et l’inférence avancée.",
        },
      ],
    ],

    types: [
      [
        {
          en: "Discrete GPU (PCIe card)",
          fr: "GPU dédié (carte PCIe)",
        },
        {
          en: "A separate expansion card with its own dedicated VRAM, VRM, and cooling system. Installs in the PCIe x16 slot. Performance scales from entry-level (RTX 4060, RX 7600 — $300) to flagship (RTX 4090, RX 7900 XTX — $900–1600). Power consumption 75W–450W. Requires 6-pin, 8-pin, or 16-pin PCIe power connectors from the PSU in addition to PCIe slot power. All professional GPU rendering, AI workstation work, and serious gaming uses discrete GPUs.",
          fr: "Un GPU dédié prend la forme d’une carte d’extension séparée, avec sa propre VRAM, son étage d’alimentation et son système de refroidissement. Il s’installe généralement dans un port PCIe x16. Les performances vont de modèles milieu de gamme abordables jusqu’aux cartes ultra haut de gamme destinées au jeu 4K, au rendu professionnel ou aux stations de travail IA. La consommation peut aller d’environ 75 W à plus de 450 W. En plus de l’alimentation fournie par le slot PCIe, ces cartes nécessitent souvent des connecteurs d’alimentation 6 broches, 8 broches ou 16 broches provenant du bloc d’alimentation. Tous les usages sérieux en rendu GPU, en IA locale ou en gaming intensif reposent sur ce type de GPU.",
        },
      ],
      [
        {
          en: "Integrated GPU (iGPU)",
          fr: "GPU intégré (iGPU)",
        },
        {
          en: "Built directly into the CPU die, sharing the CPU's system RAM rather than having dedicated VRAM. Intel UHD 770 (Alder Lake): 32 Execution Units, ~750 GFLOPS. AMD Radeon 890M (Strix Halo): 40 CUs, ~3.6 TFLOPS — dramatically faster than Intel iGPU. Apple M4: 10-core GPU, ~4.6 TFLOPS with 120GB/s memory bandwidth. iGPUs are sufficient for office tasks, 4K video playback, and light gaming at 1080p. Draw from system RAM — limiting bandwidth vs discrete GDDR6X.",
          fr: "Un iGPU est intégré directement au die du processeur et utilise la mémoire système au lieu de disposer de sa propre VRAM dédiée. On le trouve dans la majorité des CPU grand public destinés aux machines bureautiques, aux ultrabooks et à certains mini-PC. Il suffit largement pour l’affichage courant, la lecture vidéo 4K, le travail de bureau et même du jeu léger en 1080p selon les modèles. Son principal point faible reste la bande passante mémoire : comme il partage la RAM système avec le CPU, il ne peut pas rivaliser avec la GDDR6X ou d’autres mémoires dédiées très rapides d’un GPU séparé.",
        },
      ],
      [
        {
          en: "Workstation GPU",
          fr: "GPU de station de travail",
        },
        {
          en: "NVIDIA RTX Ada Pro series (formerly Quadro): certified drivers for CAD software (CATIA, SolidWorks, AutoCAD), VFX compositing (Nuke, Fusion), and 3D rendering (V-Ray, Arnold). Drivers are tested and certified for professional applications — no driver-related crashes in production. ECC VRAM available. Higher VRAM (48GB on RTX 6000 Ada). Much higher pricing than gaming equivalents ($2,000–$10,000) for essentially the same hardware with different firmware and binning.",
          fr: "Les GPU de station de travail visent les usages professionnels exigeants comme la CAO, le compositing VFX, le rendu 3D ou certaines simulations. Ils se distinguent souvent moins par le matériel brut que par leurs pilotes certifiés, testés pour des logiciels comme SolidWorks, CATIA, AutoCAD, V-Ray ou Arnold. Ils proposent parfois de la mémoire ECC, de très gros volumes de VRAM et une meilleure stabilité en environnement de production. Leur prix est nettement plus élevé que celui des cartes gaming équivalentes, précisément parce que la fiabilité logicielle et la certification ont ici une grande valeur.",
        },
      ],
      [
        {
          en: "AI / Data Center GPU",
          fr: "GPU IA / datacenter",
        },
        {
          en: "NVIDIA H100 SXM5: 80GB HBM3, 3.35TB/s memory bandwidth, 989 TFLOPS FP8 (AI inference), NVLink for multi-GPU communication up to 900GB/s. No display outputs — pure compute. Priced at $25,000–40,000. Powers ChatGPT, Midjourney, and virtually all commercial AI training. AMD Instinct MI300X: 192GB HBM3 on a single card — advantages for very large language model inference where fitting the entire model in VRAM is critical.",
          fr: "Les GPU de datacenter et d’IA sont conçus pour le calcul pur, sans sortie vidéo destinée à l’affichage. Ils utilisent souvent de la mémoire HBM extrêmement rapide, des interconnexions très haut débit comme NVLink et des unités spécialisées pour l’inférence ou l’entraînement de modèles. Leur coût est colossal, mais ils alimentent une grande partie des infrastructures modernes d’IA, du calcul scientifique et des services cloud avancés. Ils sont pensés pour être déployés en grand nombre dans des serveurs, avec des contraintes de refroidissement, de densité et de bande passante très différentes de celles du monde du gaming.",
        },
      ],
      [
        {
          en: "Mobile GPU (laptop)",
          fr: "GPU mobile (ordinateur portable)",
        },
        {
          en: "Same architectural generation as desktop but with lower base power limits (TGP: Total Graphics Power). RTX 4090 Laptop: 175W max TGP vs desktop 450W. Performance scales dramatically with TGP configuration — same GPU chip at 80W performs 40% slower than at 150W. Gaming laptops often allow users to adjust TGP in software. MUX Switch (Multiplexer) enables direct connection between GPU and display, bypassing the iGPU — reduces latency and improves gaming performance by 10–25%.",
          fr: "Les GPU mobiles reprennent souvent la même génération architecturale que les modèles desktop, mais avec des limites de puissance bien plus basses, exprimées en TGP (Total Graphics Power). Un même GPU peut ainsi offrir des performances très différentes selon qu’il est configuré à 80 W ou à 150 W dans un ordinateur portable. Les laptops gaming avancés permettent parfois d’ajuster ce TGP via logiciel. La présence d’un MUX Switch, qui connecte directement le GPU à l’écran sans passer par l’iGPU, améliore aussi la latence et les performances en jeu. Dans le monde mobile, le refroidissement joue donc un rôle encore plus décisif que sur desktop.",
        },
      ],
    ],

    conn: [
      [
        {
          en: "PCIe x16 slot",
          fr: "Slot PCIe x16",
        },
        {
          en: "The primary physical and electrical interface between GPU and motherboard. PCIe 5.0 x16 provides 128 GB/s bidirectional bandwidth. The GPU communicates with the CPU via DMA (Direct Memory Access) — it can read from and write to system RAM without CPU involvement. PCIe power is limited to 75W from the slot itself; additional power comes from dedicated 6-pin (75W), 8-pin (150W), or 16-pin 12VHPWR (600W) connectors directly from the PSU. NVIDIA's 16-pin connector has had documented failure modes from improper seating — must be fully clicked in.",
          fr: "Le slot PCIe x16 constitue l’interface physique et électrique principale entre le GPU et la carte mère. En PCIe 5.0, un slot x16 peut offrir une bande passante bidirectionnelle extrêmement élevée. Le GPU échange avec le CPU et la mémoire système via des mécanismes comme le DMA (Direct Memory Access), ce qui lui permet de lire ou d’écrire en RAM sans solliciter constamment le processeur. Le slot lui-même ne fournit qu’une partie de la puissance électrique nécessaire ; le reste doit venir de connecteurs d’alimentation dédiés reliés directement à l’alimentation du PC.",
        },
      ],
      [
        {
          en: "HDMI 2.1a",
          fr: "HDMI 2.1a",
        },
        {
          en: "Current HDMI standard on all discrete GPUs. 48Gbps bandwidth: 4K at 144Hz native (10-bit HDR), 4K at 240Hz with DSC, 8K at 60Hz with DSC. Supports Auto Low Latency Mode (ALLM) for game consoles — display switches to game mode automatically. eARC carries Dolby Atmos/DTS:X from TV to AV receiver. VRR (Variable Refresh Rate) over HDMI 2.1 is supported on certified TVs and monitors. HDMI licensing fees mean some budget monitors and GPUs use older HDMI versions.",
          fr: "Le HDMI 2.1a est le standard HDMI moderne présent sur la plupart des GPU dédiés récents. Avec jusqu’à 48 Gbit/s de bande passante, il permet notamment le 4K à 144 Hz en natif, le 4K à 240 Hz avec DSC et le 8K à 60 Hz avec compression adaptée. Il prend aussi en charge des fonctions utiles comme l’ALLM pour les consoles, l’eARC pour l’audio avancé et le VRR sur les écrans compatibles. C’est le connecteur le plus universel entre GPU, téléviseurs et moniteurs grand public.",
        },
      ],
      [
        {
          en: "DisplayPort 1.4 / 2.1",
          fr: "DisplayPort 1.4 / 2.1",
        },
        {
          en: "DisplayPort is royalty-free and preferred by monitor manufacturers for gaming displays. DP 1.4: 32.4Gbps — 4K at 144Hz with DSC. DP 2.1: 77.4Gbps — 4K at 240Hz native, 8K at 165Hz with DSC, 16K at 60Hz with DSC. Supports Multi-Stream Transport (MST): daisy-chain up to 3 monitors from a single DP port (each monitor acts as a hub). Required for high-refresh gaming monitors above 4K 144Hz without compression. Not found on TVs — exclusively computer monitors.",
          fr: "Le DisplayPort est un standard sans redevance, très apprécié des fabricants d’écrans gaming. En version 1.4, il permet déjà le 4K à 144 Hz avec DSC, tandis que le DisplayPort 2.1 monte beaucoup plus haut avec de très fortes bandes passantes. Il prend aussi en charge le Multi-Stream Transport (MST), qui permet de chaîner plusieurs moniteurs à partir d’un seul port. Pour les écrans à très haute fréquence, notamment au-delà du 4K 144 Hz sans compression, DisplayPort reste souvent la meilleure option. On le trouve en revanche très rarement sur les téléviseurs.",
        },
      ],
      [
        {
          en: "Power connectors",
          fr: "Connecteurs d’alimentation",
        },
        {
          en: "6-pin PCIe: 75W additional (total 150W with slot power). 8-pin PCIe: 150W additional (total 225W with slot power). 12+4 pin 16-pin 12VHPWR (NVIDIA): up to 600W in one connector — required for RTX 4080/4090. AMD uses dual 8-pin on flagship cards. The 12VHPWR connector requires full insertion — the 4 sense pins verify correct engagement. Partial insertion at high power loads causes connector fires. Most PSUs ship with a 3x8-pin to 16-pin adapter; native 16-pin cables from the PSU are strongly preferred.",
          fr: "Les connecteurs d’alimentation complètent l’énergie fournie par le slot PCIe. Un connecteur 6 broches ajoute environ 75 W, un 8 broches environ 150 W, et le connecteur 16 broches 12VHPWR peut monter beaucoup plus haut sur les cartes les plus gourmandes. Certaines cartes AMD haut de gamme continuent d’utiliser plusieurs connecteurs 8 broches classiques, tandis que certaines cartes NVIDIA modernes reposent sur le 12VHPWR. Ce dernier doit être inséré parfaitement, car un mauvais branchement peut entraîner de sérieux problèmes thermiques. Dans tous les cas, l’alimentation du GPU est un sujet central sur les cartes les plus puissantes.",
        },
      ],
    ],
  },

  //RAM
  ram: {
    name: {
      en: "RAM",
      fr: "RAM",
    },
    icon: "📋",
    cat: {
      en: "Memory",
      fr: "Mémoire",
    },
    tag: {
      en: "Fast and volatile — the CPU's working space",
      fr: "Rapide et volatile — l’espace de travail du CPU",
    },
    ov: {
      en: `Random Access Memory is the computer's primary short-term working memory. Unlike storage (SSDs, HDDs) which retains data indefinitely, RAM is volatile — it requires constant power to maintain its contents. The moment power is removed, all data is instantly lost. This fundamental characteristic drives the persistent memory problem in computer science: every useful piece of data must be loaded from storage into RAM before the CPU can use it.

The term "random access" distinguishes RAM from sequential-access storage like magnetic tape — any memory location can be accessed in the same time regardless of its position. This is achieved through an addressing system where each byte has a unique numerical address. The CPU's memory controller selects a row and column in the DRAM array using address lines, then reads or writes data on the data bus.

DRAM (Dynamic RAM) stores each bit as a charge on a tiny capacitor, paired with a transistor. The capacitor leaks charge over time — after ~64 milliseconds, the charge dissipates enough that a 1 becomes indistinguishable from a 0. To prevent data loss, the memory controller must continuously "refresh" every row — reading and rewriting the charge. This refresh cycle periodically locks rows and prevents access, contributing to RAM latency. Modern DDR5 RAM reduces this overhead with on-die ECC and partial array self-refresh.

The memory hierarchy's purpose is bridging the 500× latency gap between processors and DRAM. An L1 cache miss costs ~5ns. An L2 cache miss costs ~12ns. An L3 cache miss forces a DRAM access at ~70ns (DDR5). Modern CPUs implement sophisticated hardware prefetchers that analyze access patterns and preload data from RAM into cache before it's explicitly requested, hiding much of the DRAM latency from the executing code.

Dual-channel (and quad-channel) operation doubles (quadruples) the memory bus width. A single DDR5-6000 stick provides 64-bit wide access at 6,000 MT/s = 48 GB/s peak bandwidth. Two matched sticks in dual-channel widen the bus to 128 bits = 96 GB/s. For CPU-bound workloads where the memory bus is the bottleneck — particularly in integrated GPU systems where the iGPU shares the same RAM — dual-channel can improve performance by 30–50%. DDR5 also introduced per-stick 32-bit sub-channels (each DIMM has two independent 32-bit channels), improving efficiency even in single-DIMM configurations.`,
      fr: `La Random Access Memory, ou RAM, est la mémoire de travail principale à court terme de l’ordinateur. Contrairement au stockage permanent comme les SSD ou les HDD, qui conservent les données même hors tension, la RAM est volatile : elle a besoin d’une alimentation constante pour maintenir son contenu. Dès que l’alimentation est coupée, toutes les données qu’elle contient sont perdues instantanément. Cette caractéristique explique un principe fondamental de l’informatique moderne : toute donnée utile doit d’abord être chargée depuis le stockage vers la RAM avant que le CPU puisse l’utiliser.

L’expression « accès aléatoire » distingue la RAM des supports à accès séquentiel comme les bandes magnétiques : n’importe quelle case mémoire peut être atteinte en un temps comparable, quelle que soit sa position. Cela est rendu possible par un système d’adressage dans lequel chaque octet possède une adresse numérique unique. Le contrôleur mémoire du processeur sélectionne alors une ligne et une colonne dans la matrice DRAM à l’aide de lignes d’adresse, puis lit ou écrit les données via le bus de données.

La DRAM (Dynamic RAM) stocke chaque bit sous la forme d’une charge électrique contenue dans un minuscule condensateur associé à un transistor. Ce condensateur fuit naturellement : après environ 64 millisecondes, la charge peut s’être suffisamment dissipée pour qu’un 1 devienne difficile à distinguer d’un 0. Pour éviter cette perte, le contrôleur mémoire doit rafraîchir continuellement les lignes de mémoire en relisant et réécrivant leur contenu. Ce cycle de rafraîchissement bloque périodiquement certaines zones, ce qui contribue à la latence globale de la RAM. Les modules DDR5 modernes réduisent une partie de cet overhead grâce à des mécanismes comme l’ECC on-die et le self-refresh partiel.

La hiérarchie mémoire a pour rôle de combler l’écart énorme de latence entre le processeur et la DRAM. Un défaut de cache L1 coûte environ 5 ns, un défaut de cache L2 autour de 12 ns, tandis qu’un défaut de cache L3 peut forcer un accès DRAM autour de 70 ns en DDR5. Pour limiter cet impact, les CPU modernes utilisent des préfetchers matériels sophistiqués qui analysent les motifs d’accès et chargent des données en avance depuis la RAM vers les caches, avant même qu’elles ne soient explicitement demandées par le programme.

Le fonctionnement en double canal — ou en quad channel sur certaines plateformes — double ou quadruple la largeur du bus mémoire. Une seule barrette DDR5-6000 offre un bus de 64 bits pour une bande passante théorique d’environ 48 Go/s. Deux barrettes identiques en dual-channel portent cette largeur à 128 bits, soit environ 96 Go/s. Pour les charges où le bus mémoire constitue un goulot d’étranglement — en particulier sur les machines utilisant un iGPU qui partage la RAM système — cela peut améliorer les performances de 30 à 50 %. La DDR5 introduit aussi deux sous-canaux indépendants de 32 bits par barrette, ce qui améliore l’efficacité même lorsqu’un seul module est installé.`,
    },

    hist: [
      [
        "1947",
        {
          en: "Freddie Williams and Tom Kilburn develop Williams-Kilburn tube memory — 1024 bits stored on a cathode ray tube, the first random-access memory",
          fr: "Freddie Williams et Tom Kilburn développent la mémoire à tube Williams-Kilburn — 1024 bits stockés sur un tube cathodique, considérée comme la première mémoire à accès aléatoire.",
        },
      ],
      [
        "1949",
        {
          en: "MIT's Whirlwind uses magnetic core memory — tiny ferrite rings threaded on a grid of wires, each storing one bit. Reliable, fast, and dominant for 25 years",
          fr: "Le Whirlwind du MIT utilise la mémoire à tores magnétiques — de minuscules anneaux de ferrite traversés par des fils, chacun stockant un bit. Cette technologie est fiable, rapide et domine pendant environ vingt-cinq ans.",
        },
      ],
      [
        "1966",
        {
          en: "Robert Dennard at IBM invents DRAM — one transistor + one capacitor per bit, dramatically denser than core memory",
          fr: "Robert Dennard, chez IBM, invente la DRAM — un transistor et un condensateur par bit, une approche beaucoup plus dense que la mémoire à tores.",
        },
      ],
      [
        "1970",
        {
          en: "Intel 1103: first commercially available DRAM chip — 1Kb at 300ns access time. Kills magnetic core memory",
          fr: "L’Intel 1103 devient la première puce DRAM commercialisée à grande échelle — 1 Kb avec un temps d’accès d’environ 300 ns, ce qui contribue à remplacer la mémoire à tores magnétiques.",
        },
      ],
      [
        "1975",
        {
          en: "Static RAM (SRAM) chips appear — no refresh needed, faster, but much more expensive. Used for cache memory",
          fr: "Les puces SRAM (Static RAM) apparaissent — elles n’ont pas besoin de rafraîchissement, sont plus rapides, mais aussi bien plus coûteuses. Elles seront surtout utilisées pour les caches.",
        },
      ],
      [
        "1983",
        {
          en: "IBM introduces parity memory — adds one extra bit per byte to detect (but not correct) single-bit errors",
          fr: "IBM introduit la mémoire avec bit de parité — un bit supplémentaire par octet permet de détecter certaines erreurs simples, sans toutefois les corriger.",
        },
      ],
      [
        "1987",
        {
          en: "FPM DRAM (Fast Page Mode) — allows multiple accesses within the same DRAM row without re-activating the row, improving burst bandwidth",
          fr: "La FPM DRAM (Fast Page Mode) permet plusieurs accès successifs dans la même ligne mémoire sans la réactiver à chaque fois, améliorant le débit en rafale.",
        },
      ],
      [
        "1991",
        {
          en: "EDO DRAM (Extended Data Out) — begins next column access before finishing current one, ~20% faster than FPM",
          fr: "L’EDO DRAM (Extended Data Out) commence l’accès à la colonne suivante avant la fin complète de l’accès en cours, offrant un gain d’environ 20 % par rapport à la FPM.",
        },
      ],
      [
        "1993",
        {
          en: "Samsung ships first SDRAM (Synchronous DRAM) — synchronizes to the CPU bus clock, eliminating wait states",
          fr: "Samsung commercialise la première SDRAM (Synchronous DRAM) — synchronisée avec l’horloge du bus processeur, ce qui réduit fortement certains temps d’attente.",
        },
      ],
      [
        "1996",
        {
          en: "PC66 SDRAM standardized — 66MHz bus, 64-bit wide, 533 MB/s bandwidth — enables the Pentium II era",
          fr: "La SDRAM PC66 est standardisée — bus à 66 MHz, largeur de 64 bits et bande passante de 533 Mo/s, ce qui accompagne l’ère Pentium II.",
        },
      ],
      [
        "2000",
        {
          en: "DDR SDRAM (Double Data Rate) — transfers data on both rising and falling clock edges, doubling bandwidth at same clock speed. PC2100 = 2100 MB/s",
          fr: "La DDR SDRAM (Double Data Rate) transfère les données sur les fronts montants et descendants de l’horloge, doublant la bande passante à fréquence égale. La PC2100 atteint ainsi 2100 Mo/s.",
        },
      ],
      [
        "2003",
        {
          en: "DDR2 — doubled prefetch buffer (4n vs DDR's 2n), lower voltage (1.8V vs 2.5V), higher frequencies up to 1066MHz",
          fr: "La DDR2 augmente la profondeur de prélecture, réduit la tension de fonctionnement et atteint des fréquences plus élevées, jusqu’à 1066 MHz selon les variantes.",
        },
      ],
      [
        "2007",
        {
          en: "DDR3 — 8n prefetch, 1.5V, frequencies up to 2133MHz. Dominant platform for nearly a decade",
          fr: "La DDR3 introduit une prélecture 8n, une tension d’environ 1,5 V et des fréquences pouvant atteindre 2133 MHz. Elle domine le marché pendant près d’une décennie.",
        },
      ],
      [
        "2014",
        {
          en: "DDR4 — 1.2V, frequencies 2133–3200MHz base, XMP profiles to 5000MHz+. Dual-channel bandwidth up to 51 GB/s",
          fr: "La DDR4 abaisse encore la tension à 1,2 V, avec des fréquences de base entre 2133 et 3200 MT/s et des profils XMP permettant d’aller bien au-delà. Elle offre une bande passante dual-channel élevée et devient la norme sur desktop pendant de longues années.",
        },
      ],
      [
        "2017",
        {
          en: "HBM2 (High Bandwidth Memory) — 3D-stacked DRAM directly on GPU package via silicon interposer. 1TB/s bandwidth on NVIDIA V100",
          fr: "La HBM2 (High Bandwidth Memory) empile de la DRAM en 3D directement près du GPU via un interposeur silicium, permettant des bandes passantes extrêmes pouvant atteindre 1 To/s sur certaines cartes comme la NVIDIA V100.",
        },
      ],
      [
        "2021",
        {
          en: "DDR5 — 1.1V, 4800MT/s base, dual 32-bit sub-channels per DIMM, on-die ECC, up to 8400MT/s+ with XMP/EXPO",
          fr: "La DDR5 marque une nouvelle étape avec 1,1 V, une base JEDEC à 4800 MT/s, deux sous-canaux de 32 bits par DIMM et de l’ECC on-die. Avec XMP ou EXPO, les meilleurs kits montent beaucoup plus haut.",
        },
      ],
      [
        "2023",
        {
          en: "LPDDR5X — 8533MT/s, used in Snapdragon and Apple A17 Pro. First memory standard to exceed 100 GB/s in a phone",
          fr: "La LPDDR5X atteint 8533 MT/s et équipe notamment certaines puces Snapdragon et l’Apple A17 Pro. C’est l’une des premières mémoires mobiles à dépasser les 100 Go/s dans un smartphone.",
        },
      ],
    ],

    types: [
      [
        {
          en: "DRAM (Dynamic RAM)",
          fr: "DRAM (Dynamic RAM)",
        },
        {
          en: "The foundational technology for all main system memory. Uses one transistor + one capacitor per bit. Requires constant refresh (every 64ms). Organized in banks, rows, and columns. The refresh cycle causes periodic access delays. Modern DRAM cells are incredibly dense — a single DDR5 die contains 16+ billion cells in ~100mm². All DDR, LPDDR, GDDR, and HBM memory is a variant of DRAM.",
          fr: "C’est la technologie de base de la mémoire principale des systèmes modernes. Chaque bit y est stocké à l’aide d’un transistor et d’un condensateur. Comme la charge s’échappe naturellement, la DRAM doit être rafraîchie en permanence, généralement toutes les quelques dizaines de millisecondes. Elle est organisée en banques, lignes et colonnes, et ces opérations de rafraîchissement introduisent des délais supplémentaires. Toute la famille DDR, LPDDR, GDDR et HBM repose sur une variante de la DRAM.",
        },
      ],
      [
        {
          en: "SRAM (Static RAM)",
          fr: "SRAM (Static RAM)",
        },
        {
          en: "Uses 6 transistors per bit (a bistable flip-flop circuit). No refresh needed — state is stable as long as power is applied. Access time 0.3–2ns vs DRAM's 10–70ns. Consumes 30× more die area than DRAM per bit. Used exclusively in CPU caches (L1, L2, L3) and register files where cost-per-bit is irrelevant but speed and latency are paramount. A modern CPU with 32MB L3 cache uses ~100mm² of die area just for SRAM.",
          fr: "La SRAM stocke chaque bit à l’aide d’un petit circuit bistable comportant plusieurs transistors, généralement six. Elle n’a pas besoin de rafraîchissement et conserve son état tant qu’elle reste alimentée. Son temps d’accès est beaucoup plus faible que celui de la DRAM, mais elle occupe énormément plus de surface sur le silicium. C’est pourquoi on l’utilise surtout pour les caches du processeur (L1, L2, L3) et les registres, là où la vitesse compte davantage que le coût par bit.",
        },
      ],
      [
        {
          en: "DDR4 SDRAM",
          fr: "DDR4 SDRAM",
        },
        {
          en: "Fourth-generation Double Data Rate — transfers on both edges of the clock. 288-pin DIMM. 1.2V nominal operation. JEDEC standard speeds: 2133, 2400, 2666, 3200 MT/s. XMP (Intel) / AMP (AMD) profiles extend to 5000+ MT/s. Prefetch: 8 bits per internal clock. Dual-channel bandwidth at DDR4-3200: 51.2 GB/s. Still found in AM4 (Ryzen 5000) and LGA1700 (Intel 12th/13th gen) platforms. Widely available and very affordable.",
          fr: "La DDR4 est la quatrième génération grand public de mémoire Double Data Rate. Elle transfère les données sur les deux fronts de l’horloge, utilise des DIMM 288 broches et fonctionne généralement autour de 1,2 V. Les vitesses JEDEC standard vont de 2133 à 3200 MT/s, mais les profils XMP ou équivalents permettent de dépasser largement ces valeurs. Elle reste très répandue, abordable et encore présente sur de nombreuses plateformes populaires.",
        },
      ],
      [
        {
          en: "DDR5 SDRAM",
          fr: "DDR5 SDRAM",
        },
        {
          en: "Fifth generation — 1.1V, 4800 MT/s base JEDEC, up to 8400+ MT/s with XMP/EXPO. New architecture: each physical DIMM contains two independent 32-bit sub-channels rather than one 64-bit channel, improving bank efficiency. On-die ECC detects and corrects single-bit errors within each sub-channel before data reaches the CPU. On-board PMIC (Power Management IC) on the DIMM itself provides more precise voltage regulation. Required for AM5 (Ryzen 7000+) and LGA1851 (Intel Core Ultra 200).",
          fr: "La DDR5 est la cinquième génération de mémoire DDR. Elle abaisse la tension nominale à environ 1,1 V, démarre à 4800 MT/s dans la norme JEDEC et peut monter beaucoup plus haut avec les profils XMP ou EXPO. Sa nouveauté importante réside dans ses deux sous-canaux indépendants de 32 bits par barrette, ce qui améliore l’efficacité des accès. Elle intègre aussi de l’ECC on-die ainsi qu’un PMIC directement sur le module pour un meilleur contrôle de l’alimentation. Elle est obligatoire sur les plateformes modernes comme AM5.",
        },
      ],
      [
        {
          en: "LPDDR5 / LPDDR5X",
          fr: "LPDDR5 / LPDDR5X",
        },
        {
          en: `Low Power Double Data Rate — designed for mobile devices and ultrabooks. Soldered directly to the PCB — not user upgradeable. Lower voltage (1.05V vs 1.1V DDR5), aggressive power gating to extend battery life. LPDDR5X at 8533 MT/s delivers 85 GB/s bandwidth in a phone — faster than desktop DDR5. Used in Apple A and M series chips (where it is "unified memory" shared between CPU and GPU), Snapdragon 8 Gen 3, and Intel Meteor Lake thin & lights.`,
          fr: `La LPDDR5 et la LPDDR5X sont des variantes basse consommation conçues pour les appareils mobiles, les ultrabooks et certaines architectures à mémoire unifiée. Elles sont généralement soudées directement sur la carte mère, donc non évolutives par l’utilisateur. Leur tension plus faible et leurs techniques agressives de mise en veille prolongent l’autonomie. Malgré cela, elles peuvent offrir une bande passante extrêmement élevée, parfois supérieure à celle de certaines mémoires desktop, ce qui les rend particulièrement intéressantes pour les SoC modernes.`,
        },
      ],
      [
        {
          en: "GDDR6 / GDDR6X",
          fr: "GDDR6 / GDDR6X",
        },
        {
          en: "Graphics Double Data Rate — optimized for GPUs where bandwidth massively outweighs latency concerns. GDDR6: 16Gbps per pin. GDDR6X (NVIDIA NVLink PAM4 signaling): 21Gbps per pin. RTX 4090: 384-bit bus × 21 Gbps = 1,008 GB/s peak bandwidth. 12 GB/s bus × 16-bit chips = completely different architecture from desktop DRAM — many narrow-width chips in parallel rather than a few wide chips. Higher latency than DDR5 (unimportant for GPU — access patterns are highly parallel and amortized).",
          fr: "La GDDR6 et la GDDR6X sont des mémoires pensées avant tout pour les GPU, où la bande passante compte bien plus que la latence brute. Elles utilisent de nombreux chips mémoire en parallèle sur un bus très large afin d’atteindre des débits énormes. La GDDR6X pousse encore plus loin cette logique avec des méthodes de signalisation plus avancées. Leur latence est plus élevée que celle de la RAM système classique, mais cela importe moins dans les charges de travail massivement parallèles des GPU.",
        },
      ],
      [
        {
          en: "HBM (High Bandwidth Memory)",
          fr: "HBM (High Bandwidth Memory)",
        },
        {
          en: "3D-stacked DRAM connected to the GPU or CPU via Through-Silicon Vias (TSV) and a silicon interposer. HBM3: 4-hi or 8-hi stack of DRAM dies, 1024-bit wide bus per stack, 1.2 TB/s per stack. AMD MI300X uses 8 HBM3 stacks for 192GB at 5.3 TB/s total — physically adjacent to compute dies on the interposer. Extremely low latency due to proximity. Very expensive — limited to data center AI GPUs. AMD Radeon RX 7900 XTX consumer GPU uses no HBM — budget constraints favor GDDR6.",
          fr: "La HBM est une mémoire à très haute bande passante empilée en 3D et placée très près du processeur ou du GPU via des TSV et un interposeur silicium. Cette proximité permet d’obtenir des débits colossaux avec une excellente efficacité énergétique. Les versions récentes comme la HBM3 sont utilisées principalement sur les accélérateurs IA et certaines cartes de calcul pour datacenter, où leur coût très élevé reste acceptable. C’est une technologie hautement spécialisée, bien différente des modules RAM utilisés dans les PC grand public.",
        },
      ],
    ],

    conn: [
      [
        {
          en: "DIMM slot (288-pin)",
          fr: "Slot DIMM (288 broches)",
        },
        {
          en: "Desktop Dual Inline Memory Module. 288 pins on DDR4 and DDR5 (different physical notch positions prevent incorrect insertion). The DIMM slot uses a lever mechanism to eject the module. Gold-plated edge connectors make contact with the motherboard traces. Signal integrity becomes increasingly difficult above DDR5-7000 — motherboard topology (daisy chain vs T-topology) affects maximum stable speed. Populate the correct slots first (usually A2/B2) for optimal training and stability.",
          fr: "Le slot DIMM est le connecteur utilisé par les barrettes mémoire desktop. Les modules DDR4 et DDR5 utilisent tous deux 288 broches, mais avec une encoche placée différemment pour éviter toute mauvaise insertion. Le slot possède un mécanisme de verrouillage par levier. Les contacts dorés du module s’alignent avec les pistes de la carte mère. À très haute fréquence, l’intégrité du signal devient un vrai défi, et la topologie de la carte mère influence directement la stabilité. Il est aussi important de remplir les bons slots en priorité pour garantir un entraînement mémoire optimal.",
        },
      ],
      [
        {
          en: "SO-DIMM slot",
          fr: "Slot SO-DIMM",
        },
        {
          en: "Smaller module form factor used in laptops, mini PCs, and small-form-factor systems. Fewer physical dimensions than desktop DIMMs, but same electrical principles. DDR4 SO-DIMM uses 260 pins; DDR5 SO-DIMM uses 262 pins. Many modern thin-and-light laptops have abandoned SO-DIMM entirely in favor of soldered LPDDR memory for power efficiency and board space savings. Workstation and gaming laptops still frequently use SO-DIMM for upgradeability.",
          fr: "Le format SO-DIMM est la version compacte du DIMM, utilisée dans les ordinateurs portables, mini-PC et autres systèmes à faible encombrement. Il repose sur les mêmes principes électriques que les modules desktop, mais dans un format physique plus petit. De nombreuses machines ultrafines modernes abandonnent toutefois ce format au profit de mémoire soudée, notamment pour gagner de la place et améliorer l’efficacité énergétique. Les laptops gaming et certaines stations mobiles conservent encore le SO-DIMM pour permettre une mise à niveau.",
        },
      ],
      [
        {
          en: "Memory channels",
          fr: "Canaux mémoire",
        },
        {
          en: "The CPU's memory controller communicates with RAM through one or more channels. Mainstream desktop: 2 channels (dual-channel). HEDT/workstation: 4 channels (quad-channel). Server: 8–12 channels. More channels increase total bandwidth, not capacity. Channel population matters — one stick in single channel can halve effective bandwidth vs two matched sticks. This is especially important for integrated GPUs, which use system RAM as VRAM.",
          fr: "Le contrôleur mémoire du CPU communique avec la RAM via un ou plusieurs canaux. Sur un PC desktop classique, on trouve généralement deux canaux, alors que les plateformes HEDT ou serveurs peuvent en proposer beaucoup plus. Augmenter le nombre de canaux augmente la bande passante totale, pas la capacité mémoire. Le bon peuplement des canaux est donc essentiel : une seule barrette peut diviser la bande passante disponible par rapport à une configuration équilibrée avec deux modules identiques, ce qui est particulièrement important pour les machines avec iGPU.",
        },
      ],
      [
        {
          en: "XMP / EXPO profiles",
          fr: "Profils XMP / EXPO",
        },
        {
          en: "Intel XMP (Extreme Memory Profile) and AMD EXPO store tested overclock settings in the DIMM SPD EEPROM. These include frequency, primary timings (CL-tRCD-tRP-tRAS), and voltage. Enabling XMP/EXPO in BIOS applies these tuned settings automatically instead of conservative JEDEC defaults. DDR5-6000 CL30 EXPO is the current sweet spot for Ryzen 7000/9000 gaming systems. Stability depends on CPU IMC quality, motherboard trace layout, and DIMM rank count.",
          fr: "Les profils XMP d’Intel et EXPO d’AMD stockent dans la mémoire SPD du module des réglages validés par le fabricant, incluant fréquence, timings principaux et tension. Les activer dans le BIOS permet d’appliquer automatiquement des paramètres plus agressifs que les valeurs JEDEC standard. Cela simplifie énormément l’overclocking mémoire pour l’utilisateur. La stabilité finale dépend malgré tout de la qualité du contrôleur mémoire du CPU, de la carte mère et de la configuration exacte des barrettes utilisées.",
        },
      ],
      [
        {
          en: "ECC memory",
          fr: "Mémoire ECC",
        },
        {
          en: "Error-Correcting Code memory adds extra bits per word to detect and correct single-bit errors in memory. Standard ECC DIMM corrects 1-bit errors and detects 2-bit errors. Essential in servers, scientific computing, financial systems, and any environment where silent data corruption is unacceptable. Requires CPU + motherboard + firmware support. DDR5 consumer memory includes on-die ECC internally, but this is not the same as end-to-end system ECC visible to the platform.",
          fr: "La mémoire ECC ajoute des bits supplémentaires pour détecter et corriger certaines erreurs, généralement les erreurs simples sur un bit. Elle est essentielle dans les serveurs, le calcul scientifique, la finance ou tout autre environnement où une corruption silencieuse des données serait inacceptable. Son utilisation exige un support côté processeur, carte mère et firmware. Il ne faut pas confondre l’ECC système complet avec l’ECC on-die de la DDR5 grand public, qui n’offre pas le même niveau de protection visible pour l’ensemble de la plateforme.",
        },
      ],
    ],
  },

  //STORAGE
  storage: {
    name: {
      en: "Storage",
      fr: "Stockage",
    },
    icon: "💾",
    cat: {
      en: "Storage",
      fr: "Stockage",
    },
    tag: {
      en: "Where data lives when the power is off",
      fr: "Là où les données vivent quand l’alimentation est coupée",
    },
    ov: {
      en: `Storage is the component responsible for keeping data permanently, even when the computer is turned off. Unlike RAM, which loses its contents the instant power disappears, storage is non-volatile. It holds the operating system, applications, documents, photos, videos, games, databases, and every other file that must survive reboots, shutdowns, and long periods without power.

Modern storage systems are built around a trade-off between capacity, speed, durability, cost, and latency. Traditional hard disk drives (HDDs) store bits magnetically on spinning platters and offer very large capacities at low cost, but they are mechanically slow. Solid-state drives (SSDs) store data electronically in NAND flash cells, eliminating moving parts and dramatically reducing access time. NVMe SSDs connected over PCIe can deliver several gigabytes per second of throughput and extremely low latency, making the whole system feel far more responsive.

Latency matters just as much as bandwidth. An HDD may deliver decent sequential transfer speeds, but it suffers from high seek time because a mechanical arm must move to the correct track before data can be read. SSDs have no seek arm and can access random data far faster. This difference is why boot times, application launches, game loading, and system updates all feel radically different on SSD-based systems compared with older HDD-based machines.

Flash storage is organized into pages and blocks. Data can be written at the page level but erased only at the block level, which creates complexity inside the drive controller. To manage this efficiently, SSDs rely on a Flash Translation Layer (FTL), wear leveling, garbage collection, TRIM support, and spare area provisioning. These mechanisms spread writes across cells, reduce write amplification, and prolong drive lifespan.

Storage interfaces also matter. SATA was the dominant SSD interface for many years and remains common because of its wide compatibility, but it is limited to about 550 MB/s in real-world SSD throughput. NVMe over PCIe removes this bottleneck and allows the SSD to communicate with the CPU through a much more efficient queue-based protocol designed specifically for flash storage. This is why even midrange NVMe drives feel noticeably faster than SATA SSDs in heavy workloads.

Reliability in storage is never absolute. HDDs can fail mechanically, SSDs wear out through program/erase cycles, controllers can die, firmware can become corrupted, and accidental deletion or ransomware can destroy data regardless of hardware quality. That is why storage strategy must always include backups. Fast storage improves performance; good backup practices protect your life.`,
      fr: `Le stockage est le composant chargé de conserver les données de manière durable, même lorsque l’ordinateur est éteint. Contrairement à la RAM, qui perd instantanément son contenu dès que l’alimentation disparaît, le stockage est non volatil. Il contient le système d’exploitation, les applications, les documents, les photos, les vidéos, les jeux, les bases de données et tous les fichiers qui doivent survivre aux redémarrages, aux arrêts complets et aux longues périodes sans courant.

Les systèmes de stockage modernes reposent sur un compromis entre capacité, vitesse, durabilité, coût et latence. Les disques durs traditionnels (HDD) stockent les bits de manière magnétique sur des plateaux en rotation et offrent de très grandes capacités pour un coût réduit, mais restent mécaniquement lents. Les SSD, eux, stockent les données électroniquement dans des cellules de mémoire flash NAND, sans aucune pièce mobile, ce qui réduit drastiquement le temps d’accès. Les SSD NVMe connectés en PCIe peuvent atteindre plusieurs gigaoctets par seconde tout en offrant une latence très faible, ce qui rend l’ensemble du système beaucoup plus réactif.

La latence compte autant que la bande passante. Un HDD peut proposer des vitesses séquentielles correctes, mais il souffre d’un temps de recherche élevé, car une tête mécanique doit se déplacer jusqu’à la bonne piste avant de lire les données. Les SSD n’ont ni bras mécanique ni tête de lecture mobile et accèdent donc beaucoup plus vite aux données aléatoires. C’est cette différence qui explique pourquoi le démarrage du système, l’ouverture des applications, le chargement des jeux et les mises à jour paraissent radicalement plus rapides sur un SSD que sur un ancien système à disque dur.

Le stockage flash est organisé en pages et en blocs. Les données peuvent être écrites au niveau de la page, mais effacées uniquement au niveau du bloc, ce qui rend la gestion interne plus complexe. Pour s’en sortir efficacement, les SSD s’appuient sur une couche de traduction flash (FTL), sur le wear leveling, sur la collecte des déchets, sur la commande TRIM et sur une zone de réserve. Ces mécanismes répartissent les écritures entre les cellules, réduisent l’amplification d’écriture et prolongent la durée de vie du disque.

Les interfaces de stockage jouent elles aussi un rôle essentiel. Le SATA a dominé pendant des années sur les SSD et reste très courant grâce à sa large compatibilité, mais il est limité à environ 550 Mo/s en pratique. Le NVMe sur PCIe supprime ce goulot d’étranglement et permet au SSD de communiquer avec le CPU via un protocole beaucoup plus efficace, conçu spécialement pour le stockage flash. C’est la raison pour laquelle même un SSD NVMe de milieu de gamme paraît nettement plus rapide qu’un SSD SATA sur des charges soutenues.

La fiabilité du stockage n’est jamais absolue. Un HDD peut tomber en panne mécaniquement, un SSD peut s’user à force de cycles d’écriture, un contrôleur peut mourir, un firmware peut être corrompu, et une suppression accidentelle ou un ransomware peut détruire les données quelle que soit la qualité du matériel. C’est pourquoi une vraie stratégie de stockage doit toujours inclure des sauvegardes. Un stockage rapide améliore les performances ; de bonnes sauvegardes protègent votre vie numérique.`,
    },

    hist: [
      [
        "1956",
        {
          en: "IBM introduces the 350 Disk Storage Unit with the RAMAC 305 — the first commercial hard disk drive, storing about 5 MB",
          fr: "IBM introduit le 350 Disk Storage Unit avec le RAMAC 305 — le premier disque dur commercial, capable de stocker environ 5 Mo.",
        },
      ],
      [
        "1971",
        {
          en: "Intel launches the 1103 DRAM chip era while magnetic disks continue dominating permanent storage for mainframes and minicomputers",
          fr: "Alors que la DRAM commence à se démocratiser, les disques magnétiques continuent de dominer le stockage permanent des mainframes et mini-ordinateurs.",
        },
      ],
      [
        "1980",
        {
          en: "Seagate ST-506 becomes one of the first widely adopted 5.25-inch hard drives for microcomputers",
          fr: "Le Seagate ST-506 devient l’un des premiers disques durs 5,25 pouces largement adoptés dans l’univers des micro-ordinateurs.",
        },
      ],
      [
        "1983",
        {
          en: "Rodime introduces the first 3.5-inch hard disk form factor, which later becomes the desktop standard",
          fr: "Rodime introduit le premier disque dur au format 3,5 pouces, qui deviendra plus tard le standard du desktop.",
        },
      ],
      [
        "1988",
        {
          en: "SCSI storage grows in professional systems, offering more advanced command handling than consumer IDE",
          fr: "Le SCSI gagne du terrain dans les systèmes professionnels, avec une gestion des commandes plus avancée que l’IDE grand public.",
        },
      ],
      [
        "1991",
        {
          en: "SanDisk ships one of the first commercial flash-based solid-state storage products",
          fr: "SanDisk commercialise l’un des premiers produits de stockage à état solide basés sur de la mémoire flash.",
        },
      ],
      [
        "1994",
        {
          en: "CompactFlash appears, bringing flash storage into cameras, embedded devices, and portable systems",
          fr: "Le CompactFlash apparaît et amène le stockage flash dans les appareils photo, les systèmes embarqués et les machines portables.",
        },
      ],
      [
        "2003",
        {
          en: "Serial ATA (SATA) begins replacing Parallel ATA, simplifying cabling and improving bandwidth",
          fr: "Le Serial ATA (SATA) commence à remplacer le Parallel ATA, en simplifiant le câblage et en augmentant la bande passante.",
        },
      ],
      [
        "2006",
        {
          en: "Consumer SSDs begin entering the PC market, though early models are expensive and inconsistent",
          fr: "Les SSD grand public commencent à arriver sur le marché PC, même si les premiers modèles sont coûteux et parfois irréguliers.",
        },
      ],
      [
        "2009",
        {
          en: "Intel X25-M helps prove that SSDs can transform real-world system responsiveness",
          fr: "L’Intel X25-M contribue à démontrer que les SSD peuvent transformer la réactivité réelle d’un système.",
        },
      ],
      [
        "2011",
        {
          en: "mSATA and early compact SSD formats spread in laptops and ultrabooks",
          fr: "Le mSATA et d’autres formats SSD compacts se répandent dans les ordinateurs portables et les ultrabooks.",
        },
      ],
      [
        "2013",
        {
          en: "NVMe 1.0 is released, defining a storage protocol built specifically for non-volatile memory over PCIe",
          fr: "La version 1.0 de NVMe est publiée, définissant un protocole de stockage conçu spécifiquement pour la mémoire non volatile sur PCIe.",
        },
      ],
      [
        "2014",
        {
          en: "M.2 starts replacing mSATA in many systems, supporting both SATA and PCIe SSDs in a much smaller form factor",
          fr: "Le format M.2 commence à remplacer le mSATA dans de nombreuses machines, en prenant en charge les SSD SATA et PCIe dans un format beaucoup plus compact.",
        },
      ],
      [
        "2016",
        {
          en: "3D NAND becomes mainstream, dramatically increasing SSD capacity and lowering cost per gigabyte",
          fr: "La NAND 3D devient courante, augmentant fortement la capacité des SSD et réduisant le coût par gigaoctet.",
        },
      ],
      [
        "2020",
        {
          en: "PCIe 4.0 NVMe SSDs become common on consumer desktops, pushing sequential reads above 7 GB/s",
          fr: "Les SSD NVMe PCIe 4.0 deviennent courants sur desktop grand public et dépassent les 7 Go/s en lecture séquentielle.",
        },
      ],
      [
        "2023",
        {
          en: "PCIe 5.0 SSDs arrive with extremely high peak throughput, though cooling and real-world gains remain mixed",
          fr: "Les SSD PCIe 5.0 arrivent avec des débits de pointe extrêmement élevés, même si les gains réels et les contraintes thermiques restent débattus.",
        },
      ],
    ],

    types: [
      [
        {
          en: "Hard Disk Drive (HDD)",
          fr: "Disque dur (HDD)",
        },
        {
          en: "Stores data magnetically on spinning platters. A mechanical actuator arm moves read/write heads across the disk surface. HDDs offer excellent cost per terabyte and are still widely used for bulk storage, archives, surveillance systems, backups, and NAS devices. Their main weakness is latency: seek time and rotational delay make random access dramatically slower than flash-based storage. They are also vulnerable to shock and vibration because of their moving parts.",
          fr: "Il stocke les données de manière magnétique sur des plateaux en rotation. Un bras mécanique déplace les têtes de lecture et d’écriture au-dessus de la surface du disque. Les HDD offrent un excellent coût par téraoctet et restent très utilisés pour le stockage massif, les archives, la vidéosurveillance, les sauvegardes et les NAS. Leur principal défaut est la latence : le temps de recherche et la rotation rendent les accès aléatoires beaucoup plus lents que sur un stockage flash. Ils sont aussi plus sensibles aux chocs et aux vibrations à cause de leurs pièces mobiles.",
        },
      ],
      [
        {
          en: "SATA SSD",
          fr: "SSD SATA",
        },
        {
          en: "Uses NAND flash memory but connects through the SATA interface, which caps throughput around 550 MB/s in practice. SATA SSDs are still massively faster than HDDs for random access, boot times, and general responsiveness. They remain attractive for upgrades in older systems and for budget-conscious builds, especially when maximum PCIe performance is not necessary.",
          fr: "Il utilise de la mémoire flash NAND mais passe par l’interface SATA, ce qui limite le débit pratique à environ 550 Mo/s. Malgré cela, un SSD SATA reste très supérieur à un HDD pour les accès aléatoires, les temps de démarrage et la réactivité générale. Il constitue encore un très bon choix pour moderniser une ancienne machine ou pour une configuration à petit budget lorsque les performances extrêmes du PCIe ne sont pas nécessaires.",
        },
      ],
      [
        {
          en: "NVMe SSD",
          fr: "SSD NVMe",
        },
        {
          en: "Uses NAND flash over PCIe with the NVMe protocol, designed specifically for non-volatile memory. Supports massive parallel queues, much lower latency than SATA, and far higher throughput. Common in modern desktops, laptops, workstations, and consoles. Ideal for operating systems, games, heavy project files, video editing, software builds, and large asset libraries.",
          fr: "Il utilise de la mémoire flash NAND sur PCIe avec le protocole NVMe, pensé dès le départ pour le stockage non volatil. Il prend en charge des files de commandes massivement parallèles, une latence bien plus faible que le SATA et des débits beaucoup plus élevés. C’est aujourd’hui le choix standard des desktops, laptops, stations de travail et même de certaines consoles modernes. Il convient parfaitement au système d’exploitation, aux jeux, aux gros projets, au montage vidéo, à la compilation et aux bibliothèques de ressources volumineuses.",
        },
      ],
      [
        {
          en: "External SSD",
          fr: "SSD externe",
        },
        {
          en: "A portable solid-state drive connected over USB or Thunderbolt. Useful for backups, transferring large files, editing directly from external media, and carrying project libraries between systems. Performance varies widely depending on whether the enclosure uses USB 3.x, USB4, or Thunderbolt, and whether the internal drive is SATA or NVMe.",
          fr: "C’est un disque à état solide portable connecté en USB ou en Thunderbolt. Il est très utile pour les sauvegardes, le transfert de gros fichiers, le montage directement depuis un support externe ou le transport de bibliothèques de projets entre plusieurs machines. Les performances varient énormément selon l’interface utilisée — USB 3.x, USB4 ou Thunderbolt — ainsi que selon le type de SSD à l’intérieur, SATA ou NVMe.",
        },
      ],
      [
        {
          en: "NAS / network storage",
          fr: "NAS / stockage réseau",
        },
        {
          en: "Network Attached Storage is a storage system accessible over the network rather than installed directly inside one machine. It often uses multiple drives in RAID for redundancy, capacity pooling, or performance. NAS systems are common for home labs, media servers, small businesses, backups, and collaborative file access.",
          fr: "Le NAS (Network Attached Storage) est un système de stockage accessible par le réseau plutôt qu’installé directement dans une seule machine. Il utilise souvent plusieurs disques en RAID afin d’améliorer la redondance, la capacité totale ou parfois les performances. Les NAS sont très répandus dans les home labs, les serveurs multimédias, les petites entreprises, les stratégies de sauvegarde et les environnements de partage de fichiers.",
        },
      ],
      [
        {
          en: "Removable flash storage",
          fr: "Stockage flash amovible",
        },
        {
          en: "Includes USB flash drives, SD cards, microSD cards, and similar portable media. Extremely convenient and widely compatible, but quality varies enormously. Many low-cost devices have poor sustained write speed, weak controllers, and limited endurance. Best used for transport, cameras, embedded devices, and lightweight backups rather than as primary long-term storage.",
          fr: "Cela inclut les clés USB, les cartes SD, les microSD et d’autres supports portables similaires. Ils sont très pratiques et largement compatibles, mais leur qualité varie énormément. Beaucoup de modèles peu coûteux ont des vitesses d’écriture soutenue faibles, des contrôleurs modestes et une endurance limitée. Ils sont excellents pour le transport de fichiers, les appareils photo, les systèmes embarqués et certaines sauvegardes légères, mais moins adaptés comme stockage principal à long terme.",
        },
      ],
    ],

    conn: [
      [
        {
          en: "SATA",
          fr: "SATA",
        },
        {
          en: "Serial ATA is a long-standing storage interface used by HDDs and many SSDs. SATA III provides a theoretical maximum of 6 Gbit/s, which translates to roughly 550 MB/s in real SSD workloads. It is simple, mature, highly compatible, and still very common in 2.5-inch drives and many motherboards.",
          fr: "Le Serial ATA est une interface de stockage historique utilisée par les HDD et par de nombreux SSD. Le SATA III offre un maximum théorique de 6 Gbit/s, soit environ 550 Mo/s dans la pratique sur un SSD. C’est une interface simple, mature, très compatible et encore extrêmement répandue dans les disques 2,5 pouces et sur de nombreuses cartes mères.",
        },
      ],
      [
        {
          en: "PCIe / NVMe",
          fr: "PCIe / NVMe",
        },
        {
          en: "PCI Express provides the physical transport, while NVMe provides the storage protocol optimized for flash. This combination eliminates the legacy bottlenecks of SATA and AHCI. Modern M.2 NVMe drives commonly use PCIe x4 and can deliver extremely high sequential and random performance, especially in PCIe 4.0 and 5.0 generations.",
          fr: "Le PCI Express fournit le transport physique, tandis que NVMe fournit le protocole de stockage optimisé pour la mémoire flash. Cette combinaison supprime une grande partie des limitations héritées du SATA et de l’AHCI. Les SSD M.2 NVMe modernes utilisent souvent quatre lignes PCIe et offrent d’excellentes performances, aussi bien en séquentiel qu’en accès aléatoires, surtout en PCIe 4.0 et 5.0.",
        },
      ],
      [
        {
          en: "M.2 slot",
          fr: "Slot M.2",
        },
        {
          en: "M.2 is a compact physical form factor used for SSDs and some other expansion devices. It can carry either SATA or PCIe/NVMe depending on the motherboard and drive. Keying (such as B-key or M-key) helps determine compatibility. M.2 saves space but often requires attention to thermal management on high-speed drives.",
          fr: "Le M.2 est un format physique compact utilisé pour les SSD et parfois pour d’autres périphériques d’extension. Il peut transporter du SATA ou du PCIe/NVMe selon la carte mère et le disque utilisé. Le détrompage, comme les clés B ou M, aide à déterminer la compatibilité. Le M.2 fait gagner beaucoup de place, mais les SSD rapides dans ce format peuvent nécessiter un bon refroidissement.",
        },
      ],
      [
        {
          en: "U.2 / enterprise connectors",
          fr: "U.2 / connecteurs entreprise",
        },
        {
          en: "U.2 and related enterprise storage connectors are used in servers and workstations where hot-swap capability, durability, and large multi-drive backplanes are important. They often pair NVMe performance with serviceability and better thermal characteristics than small consumer M.2 sticks.",
          fr: "Le U.2 et d’autres connecteurs orientés entreprise sont utilisés dans les serveurs et stations de travail où le hot-swap, la robustesse et les baies multi-disques sont importants. Ils permettent souvent de profiter des performances NVMe tout en conservant une meilleure maintenabilité et un meilleur comportement thermique que de petits modules M.2 grand public.",
        },
      ],
      [
        {
          en: "USB / Thunderbolt",
          fr: "USB / Thunderbolt",
        },
        {
          en: "External storage commonly uses USB or Thunderbolt. USB is universal and inexpensive; Thunderbolt offers much higher performance and lower latency for demanding professional workflows. The real speed depends not just on the cable and port, but also on the controller inside the enclosure and the drive inside it.",
          fr: "Le stockage externe utilise très souvent l’USB ou le Thunderbolt. L’USB est universel et économique, tandis que le Thunderbolt offre des performances bien supérieures et une latence plus faible pour les usages professionnels exigeants. La vitesse réelle dépend non seulement du port et du câble, mais aussi du contrôleur de l’enclosure et du disque installé à l’intérieur.",
        },
      ],
    ],
  },

  //MOTHERBOARD
  motherboard: {
    name: {
      en: "Motherboard",
      fr: "Carte mère",
    },
    icon: "🔌",
    cat: {
      en: "Core",
      fr: "Cœur",
    },
    tag: {
      en: "The central nervous system connecting everything",
      fr: "Le système nerveux central qui relie tout",
    },
    ov: {
      en: "The motherboard (also called mainboard, system board, or logic board) is the primary printed circuit board that physically and electrically interconnects all components of the computer. It is the substrate on which the entire system is built — every component either plugs directly into the motherboard or connects to it via cables.\n\nModern motherboards are multilayer PCBs (Printed Circuit Boards) typically with 6–16 copper trace layers. The visible green, black, or white solder mask covers the outer layers; the inner layers carry power planes (solid copper fills for 12V, 5V, 3.3V, and ground) and signal traces connecting every component. High-speed traces (PCIe, memory buses) are impedance-controlled — their width, spacing, and distance to ground planes are precisely calculated to maintain 50–100 ohm impedance, preventing signal reflections at multi-gigabit speeds.\n\nThe VRM (Voltage Regulator Module) is the most critical power delivery subsystem on the motherboard. It converts the PSU's 12V rail to the precise CPU core voltage (0.7–1.5V) demanded by the CPU's power management firmware. A VRM consists of phases: each phase uses a high-side MOSFET, low-side MOSFET, inductor, and capacitors forming a buck converter. More phases = smoother voltage delivery at high current draws = less thermal stress per component. Premium boards have 12–24 power stages; budget boards may have 4–8. Inadequate VRMs throttle or damage CPUs under sustained all-core loads.\n\nThe PCH (Platform Controller Hub) — on modern Intel/AMD platforms a single chip versus the old North Bridge + South Bridge pair — manages all slower peripheral communication. It connects to the CPU via the DMI (Direct Media Interface) link at ~16 GB/s total bandwidth. Behind the PCH sit: USB controllers, SATA controllers, PCIe x1 and x4 slots for expansion cards, additional M.2 slots, audio codec, Ethernet controller, and Thunderbolt controller. The DMI link is a shared bus — saturating it with simultaneous high-speed USB, NVMe, and PCIe transfers creates contention.\n\nBIOS/UEFI firmware stored in a dedicated SPI NOR flash chip (32–256MB) initializes all hardware components at power-on during POST (Power-On Self-Test). Modern UEFI provides a full graphical interface with mouse support, XMP/EXPO memory profile activation, fan curve configuration, overclocking tools, CPU power limits (PL1/PL2 on Intel, PPT on AMD), and secure boot management. BIOS updates (delivered as .ROM files) can add support for new CPU generations without hardware changes — the AM5 platform has received Ryzen 7000, 8000, and 9000 series support through BIOS updates.",
      fr: "La carte mère est le circuit imprimé principal qui relie physiquement et électriquement tous les composants d’un ordinateur. Elle distribue l’alimentation, accueille le CPU, la RAM, les cartes PCIe et les périphériques de stockage, tout en assurant la communication via ses contrôleurs et son chipset. La qualité du VRM, des traces et de la connectique influence directement la stabilité, l’évolutivité et les performances.",
    },
    hist: [
      [
        "1981",
        {
          en: "IBM PC 5150 mainboard — CPU (Intel 8088), RAM slots, expansion bus (ISA), and ROM BIOS unified on a single PCB for the first time. Defines the concept of a personal computer motherboard",
          fr: "IBM PC 5150 mainboard — CPU (Intel 8088), RAM slots, expansion bus (ISA), et ROM BIOS unified on a single PCB pour the first time. Defines the concept of a personal ordinateur carte mère",
        },
      ],
      [
        "1983",
        {
          en: "IBM PC/AT introduces the 16-bit ISA bus at 8MHz — establishes the expansion card standard used until PCI in 1993",
          fr: "IBM PC/AT introduit le 16-bit ISA bus at 8MHz — establishes the expansion card standard used until PCI in 1993",
        },
      ],
      [
        "1987",
        {
          en: "AMI BIOS becomes the first third-party BIOS — begins the era of generic motherboard manufacturing separate from IBM",
          fr: "AMI BIOS devient the first third-party BIOS — begins the era of generic carte mère manufacturing separate de IBM",
        },
      ],
      [
        "1991",
        {
          en: "VLB (VESA Local Bus) — first local bus standard for graphics cards, bypassing the ISA bus bottleneck",
          fr: "VLB (VESA Local Bus) — first local bus standard pour graphics cards, bypassing the ISA bus bottleneck",
        },
      ],
      [
        "1993",
        {
          en: "PCI bus replaces ISA — 32-bit, 33MHz, 133 MB/s, device-independent. The standard for expansion cards until PCIe in 2004",
          fr: "PCI bus remplace ISA — 32-bit, 33MHz, 133 MB/s, appareil-independent. Le standard pour expansion cards until PCIe in 2004",
        },
      ],
      [
        "1995",
        {
          en: "Intel ATX form factor specification — 305×244mm board with standardized connector positions. Still the global standard 30 years later",
          fr: "Intel ATX form factor specification — 305×244mm carte avec standardized connecteur positions. Still the global standard 30 years later",
        },
      ],
      [
        "1995",
        {
          en: "Socket 7 introduces the voltage regulator on the motherboard — CPUs no longer require 5V; boards regulate down from 5V to CPU-specific voltages",
          fr: "Socket 7 introduit le tension regulator on the carte mère — CPUs no longer require 5V; boards regulate down de 5V à CPU-specific voltages",
        },
      ],
      [
        "1996",
        {
          en: "Intel MMX and AGP — Accelerated Graphics Port dedicates a separate 66MHz bus to the GPU, removing graphics from PCI contention",
          fr: "Intel MMX et AGP — Accelerated Graphics Port dedicates a separate 66MHz bus à the GPU, removing graphics de PCI contention",
        },
      ],
      [
        "1997",
        {
          en: "North Bridge / South Bridge chipset architecture universally adopted — NB handles CPU/RAM/AGP, SB handles ISA/USB/IDE/audio",
          fr: "North Bridge / South Bridge chipset architecture universally adopted — NB handles CPU/RAM/AGP, SB handles ISA/USB/IDE/audio",
        },
      ],
      [
        "1999",
        {
          en: "AMD Athlon (K7) and Socket A — first mainstream platform to separate CPU from Intel's chipset monopoly",
          fr: "AMD Athlon (K7) et Socket Un — first mainstream platform à separate CPU de Intel's chipset monopoly",
        },
      ],
      [
        "2000",
        {
          en: "Rambus RDRAM controversy — Intel mandates expensive RDRAM for Pentium 4 platforms; consumers revolt; SDRAM chipsets win",
          fr: "Rambus RDRAM controversy — Intel mandates expensive RDRAM pour Pentium 4 platforms; consumers revolt; SDRAM chipsets win",
        },
      ],
      [
        "2003",
        {
          en: "Serial ATA replaces parallel ATA — thinner cables, hot-swap support, 150 MB/s (SATA I)",
          fr: "Serial ATA remplace parallel ATA — thinner câbles, hot-swap support, 150 MB/s (SATA I)",
        },
      ],
      [
        "2004",
        {
          en: "PCI Express replaces AGP and PCI — serial point-to-point bus, PCIe 1.0 x16 provides 4 GB/s vs AGP 8×'s 2.1 GB/s",
          fr: "PCI Express remplace AGP et PCI — serial point-à-point bus, PCIe 1.0 x16 provides 4 GB/s vs AGP 8×'s 2.1 GB/s",
        },
      ],
      [
        "2006",
        {
          en: "ASUS Crosshair — first enthusiast motherboard with SLI and Crossfire on a single board",
          fr: "ASUS Crosshair — first enthusiast carte mère avec SLI et Crossfire on a single carte",
        },
      ],
      [
        "2008",
        {
          en: "Intel Nehalem (Core i7-920) — memory controller moves into CPU die; North Bridge becomes vestigial",
          fr: "Intel Nehalem (Core i7-920) — contrôleur mémoire moves dans CPU die; North Bridge devient vestigial",
        },
      ],
      [
        "2011",
        {
          en: "Intel Sandy Bridge — PCIe controller also integrated into CPU; North Bridge disappears completely from retail chipsets",
          fr: "Intel Sandy Bridge — PCIe contrôleur also integrated dans CPU; North Bridge disapparaît completely de retail chipsets",
        },
      ],
      [
        "2011",
        {
          en: "UEFI replaces legacy BIOS — mouse support, GUiID partition tables, secure boot, NVMe booting",
          fr: "UEFI remplace ancien BIOS — souris support, GUiID partition tables, secure boot, NVMe booting",
        },
      ],
      [
        "2013",
        {
          en: "M.2 slot introduced — replaces mSATA, supports both SATA and NVMe in same compact connector",
          fr: "M.2 slot introduced — remplace mSATA, supports both SATA et NVMe in same compact connecteur",
        },
      ],
      [
        "2017",
        {
          en: "AMD X399 / Intel X299 — HEDT platforms with 64+ PCIe lanes and quad-channel memory for prosumers",
          fr: "AMD X399 / Intel X299 — HEDT platforms avec 64+ PCIe voies et quad-channel mémoire pour prosumers",
        },
      ],
      [
        "2020",
        {
          en: "PCIe 4.0 mainstream on AMD X570 and Intel Z690 — doubles NVMe SSD bandwidth to 7,000 MB/s",
          fr: "PCIe 4.0 mainstream on AMD X570 et Intel Z690 — doubles NVMe SSD bande passante à 7,000 MB/s",
        },
      ],
      [
        "2022",
        {
          en: "AMD AM5 / Intel LGA1700 — DDR5, PCIe 5.0, Wi-Fi 6E standard on premium boards. USB4 40Gbps appears",
          fr: "AMD AM5 / Intel LGA1700 — DDR5, PCIe 5.0, Wi-Fi 6E standard on premium boards. USB4 40Gbps apparaît",
        },
      ],
      [
        "2024",
        {
          en: "Intel Z890 and AMD X870E — PCIe 5.0 for both GPU and NVMe, Wi-Fi 7, USB4 v2 80Gbps, 10GbE onboard",
          fr: "Intel Z890 et AMD X870E — PCIe 5.0 pour both GPU et NVMe, Wi-Fi 7, USB4 v2 80Gbps, 10GbE onboard",
        },
      ],
    ],
    types: [
      [
        {
          en: "ATX (305×244mm)",
          fr: "ATX (305×244mm)",
        },
        {
          en: "Full ATX is the most common desktop form factor — 30.5cm × 24.4cm. Provides 4+ DIMM slots (supporting up to 4 RAM sticks for dual or quad-channel), 2–3 full-length PCIe x16 slots for multi-GPU or capture cards, 3–7 M.2 slots, 4–8 SATA ports, and 4+ USB headers for the front panel. Requires a mid-tower or full-tower case. The ATX standard also defines the 24-pin main power connector and the backplate cutout dimensions — ensuring any ATX board fits any ATX case.",
          fr: "Full ATX est the most common bureau form factor — 30.5cm × 24.4cm. Provides 4+ DIMM slots (supporting up à 4 RAM sticks pour dual ou quad-channel), 2–3 full-length PCIe x16 slots pour multi-GPU ou capture cards, 3–7 M.2 slots, 4–8 SATA ports, et 4+ USB headers pour the front dalle. Requires a mid-tower ou full-tower case. Le ATX standard also defines the 24-pin main alimentation connecteur et the backplate cutout dimensions — ensuring any ATX carte fits any ATX case.",
        },
      ],
      [
        {
          en: "Micro-ATX (244×244mm)",
          fr: "Micro-ATX (244×244mm)",
        },
        {
          en: "Square form factor, 24.4cm × 24.4cm. Fits in mid-towers and some small form factor cases. Typically 2–4 DIMM slots (full dual-channel supported), 1–2 full-length PCIe x16 slots, 2–4 M.2 slots. Fewer expansion slots than ATX but lower cost — chipset savings and reduced PCB layers. Excellent value for single-GPU builds. Most budget AM5 and B760 boards use Micro-ATX.",
          fr: "Square form factor, 24.4cm × 24.4cm. Fits in mid-towers et some small form factor cases. Typically 2–4 DIMM slots (full dual-channel supported), 1–2 full-length PCIe x16 slots, 2–4 M.2 slots. Fewer expansion slots than ATX mais lower cost — chipset savings et reduced PCB layers. Excellent value pour single-GPU builds. Most budget AM5 et B760 boards utilisent Micro-ATX.",
        },
      ],
      [
        {
          en: "Mini-ITX (170×170mm)",
          fr: "Mini-ITX (170×170mm)",
        },
        {
          en: "The smallest standard PC form factor — 17cm × 17cm. Maximum of 2 DIMM slots (dual-channel supported but limited to 2 sticks), one PCIe x16 slot, typically 2 M.2 slots. Designed for SFF (Small Form Factor) cases. Every component competes for extremely limited board area. Requires careful PSU selection (SFX rather than ATX). Premium pricing despite fewer features — PCB density is very difficult to achieve at this size. Popular for living room gaming PCs and compact workstations.",
          fr: "Le smallest standard PC form factor — 17cm × 17cm. Maximum of 2 DIMM slots (dual-channel supported mais limited à 2 sticks), one PCIe x16 slot, typically 2 M.2 slots. conçu pour SFF (Small Form Factor) cases. Every component competes pour extremely limited carte area. Requires careful PSU selection (SFX rather than ATX). Premium pricing despite fewer features — PCB density est very difficult à achieve at this size. Popular pour living room jeu PCs et compact workstations.",
        },
      ],
      [
        {
          en: "E-ATX / SSI-EEB (305×330mm or larger)",
          fr: "E-ATX / SSI-EEB (305×330mm ou larger)",
        },
        {
          en: "Extended ATX: wider than standard ATX. Used for HEDT (High-End Desktop) platforms like AMD Threadripper and Intel Xeon W. Provides 8 DIMM slots for quad-channel memory up to 256GB, 4+ full-length PCIe slots, 10+ M.2 slots on premium models. Requires full-tower cases. Expensive: ASUS Pro WS WRX90E-SAGE SE (Threadripper Pro) costs $1,200 for the board alone. Not needed for mainstream gaming — relevant only for professional workstation builds.",
          fr: "Extended ATX: wider than standard ATX. utilisé pour HEDT (High-End Desktop) platforms like AMD Threadripper et Intel Xeon W. Provides 8 DIMM slots pour quad-channel mémoire up à 256GB, 4+ full-length PCIe slots, 10+ M.2 slots on premium models. Requires full-tower cases. Expensive: ASUS Pro WS WRX90E-SAGE SE (Threadripper Pro) costs $1,200 pour the carte alone. Not needed pour mainstream jeu — relevant only pour professionnel workstation builds.",
        },
      ],
      [
        {
          en: "Server / rack motherboard",
          fr: "Server / rack carte mère",
        },
        {
          en: "Proprietary form factors (SSI-MEB, WTX) designed for 1U or 2U rack servers. Features: dual CPU sockets (NUMA architecture), 24–32 DIMM slots for up to 6TB RAM, IPMI/BMC (Baseboard Management Controller) for out-of-band remote management, redundant power supply connectors, RAID controller integration. Intel C741 chipset supports Intel Xeon Scalable. No PCIe slots for consumer GPUs — expansion via PCIe riser cards. Server boards prioritize RAS over raw performance.",
          fr: "Proprietary form factors (SSI-MEB, WTX) conçu pour 1U ou 2U rack serveurs. Features: dual CPU sockets (NUMA architecture), 24–32 DIMM slots pour up à 6TB RAM, IPMI/BMC (Baseboard Management Controller) pour out-of-band remote management, redundant bloc d’alimentation connecteurs, RAID contrôleur integration. Intel C741 chipset supports Intel Xeon Scalable. No PCIe slots pour grand public GPUs — expansion via PCIe riser cards. Server boards prioritize RAS sur raw performances.",
        },
      ],
    ],
    conn: [
      [
        {
          en: "CPU socket (AM5 / LGA1851)",
          fr: "CPU socket (AM5 / LGA1851)",
        },
        {
          en: "The mechanical and electrical interface between CPU and board. AM5 (AMD): 1718 LGA holes, lever mechanism, compatible with existing AM4 coolers via bracket. LGA1851 (Intel Core Ultra 200): 1851 contact pads, ILM (Independent Loading Mechanism) with two-lever closure. Both carry: core voltage and power sense signals (dozens of pins), PCIe Gen 5 lane pairs (high-speed differential pairs), DDR5 memory bus (64-bit per channel, two channels), and management signals (power good, reset, thermal alerts). The socket is the single most expensive component to repair if damaged.",
          fr: "Le mechanical et électrique interface entre CPU et carte. AM5 (AMD): 1718 LGA holes, lever mechanism, compatible avec existing AM4 coolers via bracket. LGA1851 (Intel Core Ultra 200): 1851 contact pads, ILM (Independent Loading Mechanism) avec two-lever closure. Both carry: cœur tension et alimentation sense signaux (dozens of pins), PCIe Gen 5 voie pairs (high-vitesse differential pairs), DDR5 mémoire bus (64-bit per channel, two channels), et management signaux (alimentation good, reset, thermal alerts). Le socket est the single most expensive component à repair if damaged.",
        },
      ],
      [
        {
          en: "DIMM slots (288-pin DDR5)",
          fr: "DIMM slots (288-pin DDR5)",
        },
        {
          en: "Each DIMM slot carries the full 64-bit DDR5 data bus plus address, command, and clock signals. The slot's spring contacts are gold-plated phosphor bronze. Installing in A2+B2 (not A1+B1) enables dual-channel on most boards. JEDEC mandates specific slot loading rules — check the manual before populating only 2 of 4 slots. XMP/EXPO profiles are stored in the DIMM's SPD chip and activated in BIOS. Each slot provides 1.1V (DDR5 standard) via the on-board PMIC regulation on the DIMM itself — unlike DDR4 where the board supplies voltage directly.",
          fr: "Each DIMM slot transporte the full 64-bit DDR5 données bus plus address, command, et clock signaux. Le slot's spring contacts sont gold-plated phosphor bronze. Installing in A2+B2 (not A1+B1) permet dual-channel on most boards. JEDEC mandates specific slot loading rules — check the manual avant populating only 2 of 4 slots. XMP/EXPO profiles sont stored in the DIMM's SPD chip et activated in BIOS. Each slot provides 1.1V (DDR5 standard) via the on-carte PMIC regulation on the DIMM itself — unlike DDR4 where the carte supplies tension directly.",
        },
      ],
      [
        {
          en: "PCIe slots (x16 / x4 / x1)",
          fr: "PCIe slots (x16 / x4 / x1)",
        },
        {
          en: "PCIe x16 (CPU-direct on all modern boards): primary GPU slot. PCIe 5.0 x16 = 128 GB/s bidirectional. The slot uses a metal reinforced cage on premium boards to prevent GPU sag from heavy coolers. PCIe x4 (PCH): for capture cards, additional NVMe (via PCIe adapter), 10GbE NICs. PCIe x1 (PCH): for Wi-Fi cards, USB expansion cards, sound cards, fan controllers. Physical slot length doesn't necessarily indicate electrical width — a physical x16 slot may run at x4 electrically.",
          fr: "PCIe x16 (CPU-direct on all moderne boards): principal GPU slot. PCIe 5.0 x16 = 128 GB/s bidirectional. Le slot utilise a metal reinforced cage on premium boards à prevent GPU sag de heavy coolers. PCIe x4 (PCH): pour capture cards, additional NVMe (via PCIe adapter), 10GbE NICs. PCIe x1 (PCH): pour Wi-Fi cards, USB expansion cards, sound cards, fan contrôleurs. Physical slot length doesn't necessarily indicate électrique width — a physical x16 slot peut run at x4 electrically.",
        },
      ],
      [
        {
          en: "M.2 slots (PCIe / SATA)",
          fr: "M.2 slots (PCIe / SATA)",
        },
        {
          en: "The M.2 slot uses an edge connector with key notch positions determining compatibility. Key M (single notch on right side): supports both NVMe PCIe and SATA. Key B+M (notch on both sides): SATA only. Primary M.2 slot (closest to CPU socket) connects directly to CPU PCIe lanes for lowest latency — critical for OS drive. Secondary M.2 slots route through the PCH — share DMI bandwidth. Some boards support M.2 PCIe 5.0 (28 GB/s) on primary slot (Intel Z790/Z890, AMD X670E/X870E). Check the motherboard QVL (Qualified Vendor List) for compatible drive models.",
          fr: "Le M.2 slot utilise an edge connecteur avec touche notch positions determining compatibility. Key M (single notch on right side): supports both NVMe PCIe et SATA. Key B+M (notch on both sides): SATA only. Primary M.2 slot (closest à CPU socket) connecte directly à CPU PCIe voies pour lowest latence — critical pour OS drive. Secondary M.2 slots route à travers the PCH — share DMI bande passante. Some boards support M.2 PCIe 5.0 (28 GB/s) on principal slot (Intel Z790/Z890, AMD X670E/X870E). Check the carte mère QVL (Qualified Vendor List) pour compatible drive models.",
        },
      ],
      [
        {
          en: "SATA ports (7-pin data)",
          fr: "SATA ports (7-pin données)",
        },
        {
          en: "SATA III 6Gbps connectors for HDDs and 2.5-inch SATA SSDs. L-shaped 7-pin data connector mates with a corresponding connector on the drive. Separate 15-pin SATA power from PSU. Hot-swap supported in server configurations with appropriate hardware. On modern motherboards, SATA ports connect through the PCH. Some SATA ports may be disabled when certain M.2 slots are occupied (shared PCH bandwidth allocation). Boards typically provide 4–8 SATA ports.",
          fr: "SATA III 6Gbps connecteurs pour HDDs et 2.5-inch SATA SSDs. L-shaped 7-pin données connecteur mates avec a corresponding connecteur on the drive. Separate 15-pin SATA alimentation de PSU. Hot-swap supported in serveur configurations avec appropriate hardware. On moderne cartes mères, SATA ports connect à travers the PCH. Some SATA ports peut be disabled when certain M.2 slots sont occupied (shared PCH bande passante allocation). Boards typically provide 4–8 SATA ports.",
        },
      ],
    ],
  },

  //Ports
  ports: {
    name: {
      en: "Ports & Connectors",
      fr: "Ports et connecteurs",
    },
    icon: "🔗",
    cat: {
      en: "Connectivity",
      fr: "Connectivité",
    },
    tag: {
      en: "The gateways between your machine and the world",
      fr: "Les passerelles entre votre machine et le monde extérieur",
    },
    ov: {
      en: `Ports and connectors are the physical interfaces through which a computer communicates with external devices. To understand them clearly, it helps to separate two ideas: the connector shape and the communication protocol. A USB-C connector, for example, tells you the physical form only; it does not automatically tell you whether the port supports basic USB data, fast USB4, Thunderbolt, DisplayPort output, charging, or some combination of all of them.

That distinction is what makes modern ports confusing. The same USB-C connector can carry very different capabilities depending on the controller behind it. One port may support only slow USB 2.0 data and charging, while another may carry 40 Gbps data, multiple displays, PCIe tunneling, and high-wattage power delivery. Physically they look identical, but electrically and logically they may be dramatically different.

USB became dominant because it replaced a chaotic mixture of serial, parallel, PS/2, and proprietary ports with a hot-swappable, standardized ecosystem. Over time, bandwidth increased from USB 1.x to USB 2.0, then to multiple generations of USB 3.x, USB4, and beyond. At the same time, ports became more multifunctional: data transfer, charging, docking, display output, networking adapters, and storage all started to converge around a smaller number of physical connectors.

Thunderbolt pushed this convergence even further by combining PCIe, display transport, and high-speed peripheral connectivity into one cable. Meanwhile, networking ports such as RJ-45 remained important where low latency, stability, and predictable throughput matter more than convenience. Audio jacks, SD card slots, HDMI, DisplayPort, and legacy service connectors all continue to exist because different workloads still have different physical and electrical needs.

A good way to think about ports is that they are negotiation points between your system and the outside world. The connector provides the shape and wiring; the controller, firmware, cable quality, and protocol support determine what the link can actually do. This is why two ports that look the same may behave very differently in practice.`,
      fr: `Les ports et connecteurs sont les interfaces physiques par lesquelles un ordinateur communique avec des périphériques externes. Pour bien les comprendre, il faut distinguer deux notions : la forme du connecteur et le protocole de communication. Un port USB-C, par exemple, indique uniquement la forme physique ; il ne dit pas à lui seul si le port prend en charge un simple transfert USB, de l’USB4 rapide, du Thunderbolt, de la sortie DisplayPort, de la charge, ou plusieurs de ces fonctions à la fois.

C’est justement cette distinction qui rend les ports modernes parfois confus. Un même connecteur USB-C peut offrir des capacités très différentes selon le contrôleur placé derrière lui. Un port peut ne supporter que de l’USB 2.0 lent et la charge, tandis qu’un autre peut transporter 40 Gbit/s de données, plusieurs écrans, du tunneling PCIe et une alimentation puissante. Physiquement, ils se ressemblent, mais leurs capacités électriques et logiques peuvent être très différentes.

L’USB s’est imposé parce qu’il a remplacé un mélange chaotique de ports série, parallèle, PS/2 et propriétaires par un écosystème standardisé et hot-swappable. Au fil du temps, la bande passante a progressé depuis l’USB 1.x vers l’USB 2.0, puis vers les différentes générations d’USB 3.x, d’USB4 et au-delà. En parallèle, les ports sont devenus de plus en plus polyvalents : transfert de données, recharge, dock, affichage, adaptateurs réseau et stockage ont commencé à converger vers un plus petit nombre de connecteurs physiques.

Thunderbolt a poussé cette convergence encore plus loin en réunissant PCIe, transport d’affichage et connectivité haut débit dans un seul câble. En même temps, des ports réseau comme le RJ-45 restent essentiels dès que la faible latence, la stabilité et le débit prévisible comptent davantage que la simplicité. Les prises audio, les lecteurs de cartes SD, le HDMI, le DisplayPort et même certains connecteurs hérités continuent d’exister parce que différents usages gardent des besoins physiques et électriques différents.

On peut considérer les ports comme des points de négociation entre votre machine et le monde extérieur. Le connecteur fournit la forme et le câblage, mais le contrôleur, le firmware, la qualité du câble et le protocole réellement pris en charge déterminent ce que la liaison peut faire en pratique. C’est pourquoi deux ports qui se ressemblent visuellement peuvent se comporter de manière très différente.`,
    },

    hist: [
      [
        "1969",
        {
          en: "RS-232 serial ports become a major standard for terminals, modems, and industrial communication.",
          fr: "Le RS-232 devient un standard majeur pour les terminaux, modems et communications industrielles.",
        },
      ],
      [
        "1970s",
        {
          en: "Parallel ports become common for printers and certain external devices.",
          fr: "Les ports parallèles se généralisent pour les imprimantes et certains périphériques externes.",
        },
      ],
      [
        "1987",
        {
          en: "PS/2 connectors arrive on IBM systems, standardizing mouse and keyboard connections for many PCs.",
          fr: "Les connecteurs PS/2 arrivent sur les systèmes IBM et standardisent pendant longtemps les connexions clavier et souris sur PC.",
        },
      ],
      [
        "1996",
        {
          en: "USB 1.0 launches and begins replacing older consumer-facing peripheral ports.",
          fr: "L’USB 1.0 arrive et commence à remplacer de nombreux anciens ports grand public.",
        },
      ],
      [
        "2000",
        {
          en: "USB 2.0 dramatically increases bandwidth and helps USB become truly universal.",
          fr: "L’USB 2.0 augmente fortement la bande passante et aide l’USB à devenir réellement universel.",
        },
      ],
      [
        "2008",
        {
          en: "USB 3.0 introduces SuperSpeed and makes external storage much faster.",
          fr: "L’USB 3.0 introduit le mode SuperSpeed et accélère fortement le stockage externe.",
        },
      ],
      [
        "2011",
        {
          en: "Thunderbolt enters the market as a high-bandwidth universal peripheral interconnect.",
          fr: "Thunderbolt entre sur le marché comme interconnexion universelle haut débit pour périphériques.",
        },
      ],
      [
        "2013",
        {
          en: "USB 3.1 raises bandwidth and begins the era of confusing USB naming changes.",
          fr: "L’USB 3.1 augmente le débit et marque le début d’une période de dénominations USB parfois confuses.",
        },
      ],
      [
        "2014",
        {
          en: "USB-C appears and starts unifying data, charging, and display transport into one connector.",
          fr: "L’USB-C apparaît et commence à unifier données, recharge et affichage dans un seul connecteur.",
        },
      ],
      [
        "2015",
        {
          en: "DisplayPort over USB-C Alt Mode becomes increasingly important for laptops and docks.",
          fr: "Le mode alternatif DisplayPort sur USB-C devient de plus en plus important pour les laptops et les docks.",
        },
      ],
      [
        "2019",
        {
          en: "USB4 standardizes a Thunderbolt-inspired high-performance transport over USB-C.",
          fr: "L’USB4 standardise un transport hautes performances inspiré de Thunderbolt sur USB-C.",
        },
      ],
      [
        "2020",
        {
          en: "Thunderbolt 4 tightens minimum feature requirements and makes premium docking more predictable.",
          fr: "Thunderbolt 4 renforce les exigences minimales et rend les docks haut de gamme plus prévisibles.",
        },
      ],
      [
        "2022",
        {
          en: "USB4 v2 and newer generations push even higher bandwidth over modern USB-C links.",
          fr: "L’USB4 v2 et les nouvelles générations poussent encore plus loin la bande passante sur les liaisons USB-C modernes.",
        },
      ],
      [
        "2024",
        {
          en: "Modern systems increasingly converge around USB-C, Thunderbolt, HDMI, DisplayPort, and high-speed networking.",
          fr: "Les systèmes modernes convergent de plus en plus autour de l’USB-C, du Thunderbolt, du HDMI, du DisplayPort et du réseau haut débit.",
        },
      ],
    ],

    types: [
      [
        { en: "USB-A", fr: "USB-A" },
        {
          en: "The classic rectangular USB connector still common on desktops, monitors, TVs, chargers, and countless peripherals. Its capabilities vary widely depending on the underlying USB generation.",
          fr: "C’est le connecteur USB rectangulaire classique, encore très courant sur les desktops, moniteurs, téléviseurs, chargeurs et innombrables périphériques. Ses capacités varient fortement selon la génération USB réellement utilisée.",
        },
      ],
      [
        { en: "USB-C", fr: "USB-C" },
        {
          en: "A small reversible connector that can carry many different protocols and power levels. It has become the most flexible modern connector, but also one of the most confusing because identical-looking ports may support very different features.",
          fr: "C’est un petit connecteur réversible capable de transporter de nombreux protocoles et niveaux d’alimentation. Il est devenu le connecteur moderne le plus flexible, mais aussi l’un des plus déroutants, car deux ports identiques peuvent offrir des fonctions très différentes.",
        },
      ],
      [
        { en: "HDMI", fr: "HDMI" },
        {
          en: "A very common digital audio/video connector used by TVs, monitors, consoles, GPUs, and media devices. It is especially dominant in consumer electronics.",
          fr: "C’est un connecteur audio/vidéo numérique extrêmement courant sur les téléviseurs, moniteurs, consoles, GPU et appareils multimédias. Il domine particulièrement le monde grand public.",
        },
      ],
      [
        { en: "DisplayPort", fr: "DisplayPort" },
        {
          en: "A digital display connector widely used in PC environments, especially for high-refresh monitors and advanced multi-display setups. It is often favored in enthusiast and workstation displays.",
          fr: "C’est un connecteur d’affichage numérique très répandu dans l’univers PC, surtout pour les écrans à haute fréquence et les configurations multi-écrans avancées. Il est souvent privilégié sur les écrans orientés passionnés et stations de travail.",
        },
      ],
      [
        { en: "RJ-45 Ethernet", fr: "RJ-45 Ethernet" },
        {
          en: "The standard wired networking connector for stable, low-latency, predictable network connections. It remains essential for gaming, servers, workstations, offices, and any environment where wireless is not good enough.",
          fr: "C’est le connecteur réseau filaire standard pour des connexions stables, à faible latence et au débit prévisible. Il reste indispensable pour le gaming, les serveurs, les stations de travail, les bureaux et tous les environnements où le sans-fil ne suffit pas.",
        },
      ],
      [
        {
          en: "Audio jack / SD / legacy service ports",
          fr: "Prise audio / SD / ports hérités",
        },
        {
          en: "These include analog audio jacks, card readers, and older specialized connectors that still exist because some devices and workflows need them. Even in a USB-C world, not every workload has fully converged.",
          fr: "Cela inclut les prises audio analogiques, les lecteurs de cartes et certains connecteurs spécialisés plus anciens qui subsistent parce que certains appareils et usages en ont toujours besoin. Même dans un monde dominé par l’USB-C, tous les flux de travail n’ont pas totalement convergé.",
        },
      ],
    ],

    conn: [
      [
        { en: "Protocol vs connector", fr: "Protocole vs connecteur" },
        {
          en: "A connector defines physical shape; a protocol defines what data and signaling behavior the port actually supports. Confusing these two is the source of most modern port misunderstandings.",
          fr: "Un connecteur définit une forme physique ; un protocole définit le type de données et le comportement électrique réellement pris en charge. Confondre les deux est la cause de la majorité des malentendus sur les ports modernes.",
        },
      ],
      [
        { en: "USB generations", fr: "Générations USB" },
        {
          en: "USB has evolved through many generations with changing names and bandwidth levels. In practice, the controller, cable, device support, and firmware all influence the final result.",
          fr: "L’USB a évolué à travers de nombreuses générations avec des noms et des niveaux de débit changeants. En pratique, le contrôleur, le câble, le périphérique et le firmware influencent tous le résultat final.",
        },
      ],
      [
        { en: "Thunderbolt", fr: "Thunderbolt" },
        {
          en: "Thunderbolt combines high-speed data, PCIe transport, display transport, and power delivery in one ecosystem. It is especially valuable for premium docks, external storage, pro displays, and demanding laptop workflows.",
          fr: "Thunderbolt combine données haut débit, transport PCIe, affichage et alimentation dans un seul écosystème. Il est particulièrement utile pour les docks premium, le stockage externe, les écrans pro et les usages exigeants sur laptop.",
        },
      ],
      [
        {
          en: "Cable quality and feature support",
          fr: "Qualité du câble et support des fonctions",
        },
        {
          en: "Two identical-looking cables may support radically different power, bandwidth, or display features. A weak cable can limit the whole connection even if the port itself is capable of much more.",
          fr: "Deux câbles qui se ressemblent peuvent prendre en charge des puissances, débits ou fonctions d’affichage très différents. Un câble médiocre peut limiter toute la connexion, même si le port lui-même est bien plus capable.",
        },
      ],
      [
        { en: "Controller dependency", fr: "Dépendance au contrôleur" },
        {
          en: "The true capability of a port depends on the controller and system design behind it. This is why the same connector shape can behave very differently across devices.",
          fr: "La capacité réelle d’un port dépend du contrôleur et de la conception du système placés derrière lui. C’est pour cela qu’un même connecteur peut se comporter très différemment selon l’appareil.",
        },
      ],
    ],
  },

  //DataFlow
  dataflow: {
    name: {
      en: "Data Flow",
      fr: "Flux de données",
    },
    icon: "⚡",
    cat: {
      en: "Architecture",
      fr: "Architecture",
    },
    tag: {
      en: "How information travels inside your machine",
      fr: "Comment l’information circule à l’intérieur de votre machine",
    },
    ov: {
      en: `Understanding data flow in a computer means understanding how information moves between the CPU, memory, storage, GPU, and peripherals — and where the bottlenecks appear. A system is not uniformly fast. It is fast or slow depending on which path the data must take and which component becomes the limiting step.

In a traditional PC architecture, the CPU sits at the center of many important movements. Data may travel directly between the CPU and RAM over the memory bus, between the CPU and a discrete GPU or primary NVMe drive over PCIe, or between the CPU and slower peripheral subsystems through the chipset link. The exact route matters, because each path has different bandwidth, latency, and contention characteristics.

The memory hierarchy exists because processors are far faster than main memory. L1, L2, and L3 caches sit between the execution cores and DRAM so the CPU does not have to wait on every access. When data is found in cache, the processor can continue quickly. When it is not, the CPU may stall while waiting for slower memory. This is why cache size and memory behavior can change real-world performance dramatically even when raw clock speed does not change much.

Data movement to and from the GPU adds another layer. A game or graphics application may prepare assets in system memory, then instruct the GPU to pull them into VRAM using DMA over PCIe. Once in the GPU, that data moves through the rendering pipeline: geometry processing, rasterization, shading, framebuffer output, and finally display scan-out to the monitor. In newer systems, some storage-to-GPU paths can bypass older bottlenecks more directly, reducing load times and CPU overhead.

Networking reveals another kind of flow. A web request, for example, travels from an application through the operating system’s network stack, through kernel buffers and drivers, into the NIC, across the physical network, and back again. At every stage, latency, buffering, protocol behavior, and hardware capability influence the total result. Storage works similarly: an application request may travel through the filesystem, the OS cache, the storage driver, the storage controller, and finally the media itself.

Thinking in terms of data flow helps explain why some upgrades feel dramatic and others do not. Faster storage helps when storage is the bottleneck. More memory helps when the system is starved for working space. Bigger cache helps when the workload repeatedly touches the same data. More GPU bandwidth helps when rendering is blocked by graphics memory movement. Performance is always a story about where the data has to go next.`,
      fr: `Comprendre le flux de données dans un ordinateur, c’est comprendre comment l’information circule entre le CPU, la mémoire, le stockage, le GPU et les périphériques — ainsi que les endroits où apparaissent les goulots d’étranglement. Un système n’est pas uniformément rapide. Il est rapide ou lent selon le chemin que doivent emprunter les données et selon le composant qui devient la limite à un moment donné.

Dans une architecture PC classique, le CPU se trouve au centre d’une grande partie de ces mouvements. Les données peuvent circuler directement entre le CPU et la RAM via le bus mémoire, entre le CPU et un GPU dédié ou un SSD NVMe principal via le PCIe, ou encore entre le CPU et des sous-systèmes plus lents via la liaison vers le chipset. Le chemin exact compte énormément, car chaque liaison a ses propres caractéristiques de bande passante, de latence et de contention.

La hiérarchie mémoire existe parce que les processeurs sont beaucoup plus rapides que la mémoire principale. Les caches L1, L2 et L3 s’intercalent entre les cœurs d’exécution et la DRAM afin d’éviter au CPU d’attendre à chaque accès mémoire. Quand les données sont trouvées dans le cache, le processeur peut continuer presque immédiatement. Lorsqu’elles n’y sont pas, le CPU peut se retrouver bloqué en attendant une mémoire bien plus lente. C’est pourquoi la taille du cache et le comportement mémoire peuvent modifier fortement les performances réelles, même lorsque la fréquence brute varie peu.

Le déplacement des données vers et depuis le GPU ajoute un autre niveau de complexité. Un jeu ou une application graphique peut préparer des ressources en mémoire système, puis demander au GPU de les récupérer en VRAM via DMA sur PCIe. Une fois dans le GPU, ces données traversent le pipeline de rendu : traitement de la géométrie, rasterisation, shading, écriture dans le framebuffer, puis envoi final vers le moniteur. Sur les systèmes récents, certains chemins entre le stockage et le GPU contournent plus directement d’anciens goulets d’étranglement, ce qui réduit les temps de chargement et la charge CPU.

Le réseau illustre un autre type de flux. Une requête web, par exemple, traverse l’application, la pile réseau du système d’exploitation, les buffers du noyau, les pilotes, la carte réseau, le support physique, puis le chemin retour. À chaque étape, la latence, la mise en tampon, le comportement du protocole et les capacités matérielles influencent le résultat total. Le stockage fonctionne de manière comparable : une requête peut traverser le système de fichiers, le cache du système, le pilote de stockage, le contrôleur et enfin le média physique lui-même.

Raisonner en termes de flux de données aide à comprendre pourquoi certaines mises à niveau changent radicalement l’expérience, alors que d’autres ont peu d’effet visible. Un stockage plus rapide aide quand le stockage est le goulot d’étranglement. Plus de mémoire aide quand le système manque d’espace de travail. Plus de cache aide quand la charge manipule souvent les mêmes données. Plus de bande passante GPU aide quand le rendu est limité par les transferts mémoire graphiques. En pratique, la performance est toujours l’histoire du prochain endroit où les données doivent aller.`,
    },

    hist: [
      [
        "1945",
        {
          en: "Von Neumann’s stored-program architecture formalizes CPU, memory, and I/O as distinct but connected parts.",
          fr: "L’architecture à programme enregistré de von Neumann formalise le CPU, la mémoire et les E/S comme des éléments distincts mais reliés.",
        },
      ],
      [
        "1946",
        {
          en: "ENIAC still relies on physical rewiring rather than modern internal data path flexibility.",
          fr: "L’ENIAC repose encore sur du recâblage physique plutôt que sur une vraie flexibilité moderne des flux internes.",
        },
      ],
      [
        "1950s",
        {
          en: "Early bus-based machines establish the idea of shared paths between processing and memory.",
          fr: "Les premières machines à bus posent l’idée de chemins partagés entre traitement et mémoire.",
        },
      ],
      [
        "1960s",
        {
          en: "Minicomputers popularize unified bus architectures for practical system design.",
          fr: "Les mini-ordinateurs popularisent les architectures à bus unifié dans la conception pratique des systèmes.",
        },
      ],
      [
        "1981",
        {
          en: "The original IBM PC uses slow shared buses, making device contention a major design limit.",
          fr: "Le PC IBM d’origine utilise des bus lents et partagés, faisant de la contention entre périphériques une limite majeure.",
        },
      ],
      [
        "1988",
        {
          en: "On-die CPU cache becomes a major tool for hiding main-memory latency.",
          fr: "Le cache intégré au CPU devient un outil majeur pour masquer la latence de la mémoire principale.",
        },
      ],
      [
        "1990s",
        {
          en: "Dedicated graphics paths and better bus designs improve data movement for visual workloads.",
          fr: "Les chemins graphiques dédiés et de meilleurs bus améliorent la circulation des données pour les charges visuelles.",
        },
      ],
      [
        "2004",
        {
          en: "PCIe begins replacing older parallel buses with dedicated serial point-to-point links.",
          fr: "Le PCIe commence à remplacer les anciens bus parallèles par des liaisons série point à point dédiées.",
        },
      ],
      [
        "2008",
        {
          en: "Integrated memory controllers reduce latency and shift memory traffic closer to the CPU.",
          fr: "Les contrôleurs mémoire intégrés réduisent la latence et rapprochent le trafic mémoire du CPU.",
        },
      ],
      [
        "2011",
        {
          en: "Classic North Bridge designs effectively disappear from mainstream PC architecture.",
          fr: "Les architectures classiques à North Bridge disparaissent pratiquement du PC grand public.",
        },
      ],
      [
        "2013",
        {
          en: "NVMe over PCIe radically changes storage data paths by reducing legacy protocol overhead.",
          fr: "Le NVMe sur PCIe transforme radicalement les flux de stockage en réduisant l’overhead des anciens protocoles.",
        },
      ],
      [
        "2020",
        {
          en: "Modern asset streaming paths let some systems move data more directly from fast storage toward GPU workloads.",
          fr: "Les chemins modernes de streaming d’assets permettent à certains systèmes d’acheminer plus directement les données du stockage rapide vers les charges GPU.",
        },
      ],
      [
        "2020",
        {
          en: "Unified memory designs in some ARM systems reduce copy overhead between compute engines.",
          fr: "Les architectures à mémoire unifiée de certains systèmes ARM réduisent les copies entre moteurs de calcul.",
        },
      ],
      [
        "2024",
        {
          en: "New interconnect and memory technologies continue pushing lower-latency, higher-bandwidth internal communication.",
          fr: "Les nouvelles technologies d’interconnexion et de mémoire continuent de pousser les communications internes vers plus de bande passante et moins de latence.",
        },
      ],
    ],

    types: [
      [
        { en: "CPU ↔ RAM", fr: "CPU ↔ RAM" },
        {
          en: "This is one of the most important internal paths in a computer. It determines how quickly the processor can pull working data from memory when caches are not enough.",
          fr: "C’est l’un des chemins internes les plus importants d’un ordinateur. Il détermine la vitesse à laquelle le processeur peut récupérer des données de travail lorsque les caches ne suffisent plus.",
        },
      ],
      [
        { en: "CPU ↔ GPU", fr: "CPU ↔ GPU" },
        {
          en: "This path commonly uses PCIe and is critical for discrete graphics. It carries commands, resource uploads, and many forms of coordination between the processor and the graphics card.",
          fr: "Ce chemin utilise généralement le PCIe et est essentiel avec un GPU dédié. Il transporte les commandes, les transferts de ressources et de nombreuses formes de coordination entre le processeur et la carte graphique.",
        },
      ],
      [
        { en: "CPU ↔ storage", fr: "CPU ↔ stockage" },
        {
          en: "This path determines how software, assets, and files reach the processor and memory. Its behavior depends heavily on whether the system is using SATA, NVMe, caching, and direct CPU-connected or chipset-connected devices.",
          fr: "Ce chemin détermine comment les logiciels, ressources et fichiers atteignent le processeur et la mémoire. Son comportement dépend fortement du SATA, du NVMe, du cache et du fait que le périphérique soit relié directement au CPU ou via le chipset.",
        },
      ],
      [
        { en: "GPU internal pipeline", fr: "Pipeline interne du GPU" },
        {
          en: "Once data is inside the GPU, it flows through stages such as geometry processing, rasterization, shading, and final framebuffer output. This internal flow is just as important as external bandwidth.",
          fr: "Une fois les données dans le GPU, elles traversent des étapes comme le traitement géométrique, la rasterisation, le shading et l’écriture finale dans le framebuffer. Ce flux interne est aussi important que la bande passante externe.",
        },
      ],
      [
        { en: "Network data path", fr: "Flux réseau" },
        {
          en: "Network traffic moves through application code, the operating system stack, drivers, buffers, the NIC, and the physical network. Understanding this helps explain latency, jitter, and throughput behavior.",
          fr: "Le trafic réseau traverse le code applicatif, la pile du système, les pilotes, les buffers, la carte réseau et le support physique. Comprendre ce chemin aide à expliquer la latence, le jitter et le débit.",
        },
      ],
    ],

    conn: [
      [
        { en: "Memory bus", fr: "Bus mémoire" },
        {
          en: "The link between the CPU and RAM, with bandwidth and latency characteristics that strongly affect real performance.",
          fr: "C’est la liaison entre le CPU et la RAM, dont la bande passante et la latence influencent fortement les performances réelles.",
        },
      ],
      [
        { en: "PCIe fabric", fr: "Tissu PCIe" },
        {
          en: "The high-speed serial interconnect used for GPUs, NVMe drives, and many expansion devices. It is central to modern PC data movement.",
          fr: "C’est l’interconnexion série haut débit utilisée pour les GPU, les SSD NVMe et de nombreux périphériques d’extension. Elle est au cœur du déplacement des données dans les PC modernes.",
        },
      ],
      [
        { en: "Chipset / platform link", fr: "Chipset / liaison plateforme" },
        {
          en: "This shared path connects the CPU to slower peripheral subsystems and can become a bottleneck when many devices are active at once.",
          fr: "Ce chemin partagé relie le CPU aux sous-systèmes périphériques plus lents et peut devenir un goulot d’étranglement lorsque beaucoup de périphériques travaillent en même temps.",
        },
      ],
      [
        { en: "DMA transfers", fr: "Transferts DMA" },
        {
          en: "Direct Memory Access lets devices move data without constant CPU intervention, which is crucial for GPUs, storage, and networking.",
          fr: "Le Direct Memory Access permet aux périphériques de déplacer des données sans intervention constante du CPU, ce qui est crucial pour les GPU, le stockage et le réseau.",
        },
      ],
      [
        { en: "Display scan-out", fr: "Balayage d’affichage" },
        {
          en: "This is the final path where the completed framebuffer is read and sent to the monitor at the chosen refresh rate.",
          fr: "C’est le chemin final où le framebuffer terminé est relu puis envoyé vers le moniteur au taux de rafraîchissement choisi.",
        },
      ],
    ],
  },
};

