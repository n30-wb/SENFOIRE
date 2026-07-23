import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, PageBreak, Tab, TabStopPosition, TabStopType,
  TableOfContents, Footer, Header, PageNumber, NumberFormat,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  convertInchesToTwip, ShadingType, UnderlineType
} from 'docx';
import { writeFileSync, readFileSync } from 'fs';

// Helper functions
function heading1(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 28, font: 'Times New Roman' })],
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    alignment: AlignmentType.CENTER,
  });
}

function heading2(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, font: 'Times New Roman' })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
  });
}

function heading3(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24, font: 'Times New Roman' })],
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
  });
}

function heading4(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, font: 'Times New Roman' })],
    heading: HeadingLevel.HEADING_4,
    spacing: { before: 200, after: 100 },
  });
}

function heading5(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 21, font: 'Times New Roman' })],
    heading: HeadingLevel.HEADING_5,
    spacing: { before: 150, after: 80 },
  });
}

function para(text, options = {}) {
  const runs = [];
  // Handle bold markers **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true, size: 24, font: 'Times New Roman', ...options }));
    } else {
      runs.push(new TextRun({ text: part, size: 24, font: 'Times New Roman', ...options }));
    }
  }
  return new Paragraph({
    children: runs,
    spacing: { after: 120, line: 360 },
    alignment: AlignmentType.JUSTIFIED,
    indent: options.indent ? { firstLine: convertInchesToTwip(0.5) } : undefined,
  });
}

function emptyPara() {
  return new Paragraph({ children: [new TextRun({ text: '', size: 24, font: 'Times New Roman' })], spacing: { after: 120 } });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function capturePlaceholder(title) {
  return new Paragraph({
    children: [
      new TextRun({ text: `[${title}]`, bold: true, italics: true, size: 22, font: 'Times New Roman', color: '666666' }),
    ],
    spacing: { before: 200, after: 200 },
    alignment: AlignmentType.CENTER,
    border: {
      top: { style: BorderStyle.DASHED, size: 1, color: '999999' },
      bottom: { style: BorderStyle.DASHED, size: 1, color: '999999' },
      left: { style: BorderStyle.DASHED, size: 1, color: '999999' },
      right: { style: BorderStyle.DASHED, size: 1, color: '999999' },
    },
  });
}

function codeBlock(code) {
  const lines = code.split('\n');
  const paragraphs = lines.map(line => 
    new Paragraph({
      children: [new TextRun({ text: line || ' ', size: 20, font: 'Consolas' })],
      spacing: { after: 0, line: 240 },
      indent: { left: convertInchesToTwip(0.3) },
    })
  );
  return [
    new Paragraph({
      children: [new TextRun({ text: ' ', size: 20 })],
      spacing: { before: 100, after: 0 },
    }),
    ...paragraphs,
    new Paragraph({
      children: [new TextRun({ text: ' ', size: 20 })],
      spacing: { before: 0, after: 100 },
    }),
  ];
}

function tableRow(cells, isHeader = false) {
  return new TableRow({
    children: cells.map(cell => 
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: cell, bold: isHeader, size: 20, font: 'Times New Roman' })],
          spacing: { after: 0 },
        })],
        shading: isHeader ? { type: ShadingType.SOLID, color: 'D9E2F3' } : undefined,
      })
    ),
  });
}

// Build the document
const sections = [];

// ============ FRONT MATTER ============
sections.push({
  properties: {
    page: {
      margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.2), right: convertInchesToTwip(1) },
    },
  },
  children: [
    // DEDICACES
    heading1('DÉDICACES'),
    emptyPara(),
    para('Je dédie ce mémoire :', { indent: true }),
    emptyPara(),
    para('À mon père, **Mouhamadou NDIAYE**, pour ses sacrifices et son soutien indéfectible tout au long de mon parcours académique.', { indent: true }),
    emptyPara(),
    para('À ma mère, **Astou DIOUF**, pour ses prières, sa tendresse et son amour inconditionnel.', { indent: true }),
    emptyPara(),
    para('À mes frères et sœurs, **Abdoulaye, Ibrahima, Aminata et Mariama**, pour leur encouragement constant.', { indent: true }),
    emptyPara(),
    para('À toute ma famille et à mes proches, pour leur soutien moral et matériel.', { indent: true }),
    emptyPara(),
    para('À tous les commerçants et artisans sénégalais, qui œuvrent chaque jour dans les marchés traditionnels et dont l\'activité a inspiré la conception de cette plateforme.', { indent: true }),
    emptyPara(),
    para('À mon directeur de mémoire, **M. Dr Moustapha DER**, pour sa guidance, sa patience et ses précieux conseils.', { indent: true }),

    pageBreak(),

    // REMERCIEMENTS
    heading1('REMERCIEMENTS'),
    emptyPara(),
    para('La réalisation de ce mémoire a été l\'aboutissement dun long parcours ponctué de défis, de découvertes et de satisfaction. Ce travail n\'aurait pas vu le jour sans le concours de plusieurs personnes à qui j\'adresse mes sincères remerciements.', { indent: true }),
    emptyPara(),
    para('Je tiens tout dabord à remercier le **Très-Haut** pour la santé, la force et l\'intelligence dont il m\'a doté tout au long de ce cursus.', { indent: true }),
    emptyPara(),
    para('Mes remerciements vont ensuite à mon directeur de mémoire, **M. Dr Moustapha DER**, pour sa disponibilité, sa rigueur scientifique et ses orientations précieuses qui ont guidé l\'élaboration de ce travail. Ses conseils pertinents et sa patience ont été déterminants dans la finalisation de ce projet.', { indent: true }),
    emptyPara(),
    para('Je remercie également l\'ensemble du corps professoral de l\'**École Supérieure Multinationale des Télécommunications (ESMT)**, et plus particulièrement ceux du département Développement dApplications Réparties, pour la qualité de la formation reçue tout au long de ces trois années.', { indent: true }),
    emptyPara(),
    para('Mes remerciements s\'adressent également à mes collègues et amis de promotion, avec qui j\'ai partagé dinnombrables heures de travail, de réflexion et de camaraderie. Leurs encouragements mutuels ont été une source de motivation constante.', { indent: true }),
    emptyPara(),
    para('Enfin, je remercie ma famille pour son soutien indéfectible, sa patience et ses sacrifices, sans lesquels ce parcours n\'aurait pas été possible.', { indent: true }),

    pageBreak(),

    // GLOSSAIRE
    heading1('GLOSSAIRE'),
    emptyPara(),
    ...[
      ['API', 'Application Programming Interface — interface de programmation permettant la communication entre deux systèmes logiciels'],
      ['Bazar', 'Modèle commercial multi-vendeurs où chaque vendeur gère son propre espace de vente'],
      ['Caissier', 'Agent chargé de valider les paiements en espèces ou via mobile money au sein de la plateforme'],
      ['Commande récurrente', 'Commande programmée qui se répète automatiquement selon une fréquence définie'],
      ['Dashboard', 'Tableau de bord — interface de synthèse affichant les indicateurs clés dun utilisateur'],
      ['FCM', 'Firebase Cloud Messaging — service de notification push de Google'],
      ['Fidélité', 'Programme de récompense attribuant des points aux clients pour leurs achats'],
      ['GPS', 'Global Positioning System — système de géolocalisation par satellite'],
      ['Haversine', 'Formule mathématique de calcul de distance entre deux points géographiques'],
      ['Livreur', 'Agent chargé de la livraison des commandes aux clients'],
      ['Mobile Money', 'Service de paiement électronique via téléphone mobile (Wave, Orange Money)'],
      ['PWA', 'Progressive Web Application — application web fonctionnant comme une application native'],
      ['Sanctum', 'Système dauthentification par tokens de Laravel'],
      ['Stand', 'Espace commercial virtuel dun vendeur au sein de la foire'],
      ['Split Payment', 'Paiement fractionné — division automatique du montant entre vendeur et plateforme'],
      ['Vendeur', 'Commerçant proposant ses produits au sein dun stand sur la plateforme'],
    ].flatMap(([term, def]) => [
      new Table({
        rows: [new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: term, bold: true, size: 22, font: 'Times New Roman' })] })],
              width: { size: 2500, type: WidthType.DXA },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: def, size: 22, font: 'Times New Roman' })] })],
            }),
          ],
        })],
        width: { size: 9000, type: WidthType.DXA },
      }),
      emptyPara(),
    ]),

    pageBreak(),

    // SIGLES ET ABBREVIATIONS
    heading1('SIGLES ET ABRÉVIATIONS'),
    emptyPara(),
    ...[
      ['API', 'Application Programming Interface'],
      ['CA', 'Chiffre dAffaires'],
      ['CNI', 'Carte Nationale dIdentité'],
      ['CRUD', 'Create, Read, Update, Delete'],
      ['CSS', 'Cascading Style Sheets'],
      ['DCU', 'Diagramme de Cas dUtilisation'],
      ['ESMT', 'École Supérieure Multinationale des Télécommunications'],
      ['FCFA', 'Franc de la Communauté Financière Africaine'],
      ['FCM', 'Firebase Cloud Messaging'],
      ['GPS', 'Global Positioning System'],
      ['HTML', 'HyperText Markup Language'],
      ['JSX', 'JavaScript XML'],
      ['KYC', 'Know Your Customer'],
      ['MVC', 'Model-View-Controller'],
      ['OM', 'Orange Money'],
      ['PWA', 'Progressive Web Application'],
      ['REST', 'Representational State Transfer'],
      ['SQL', 'Structured Query Language'],
      ['UML', 'Unified Modeling Language'],
      ['VAPID', 'Voluntary Application Server Identification'],
    ].map(([sigle, signification]) =>
      new Table({
        rows: [new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: sigle, bold: true, size: 22, font: 'Times New Roman' })] })],
              width: { size: 2000, type: WidthType.DXA },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: signification, size: 22, font: 'Times New Roman' })] })],
            }),
          ],
        })],
        width: { size: 9000, type: WidthType.DXA },
      })
    ).flatMap(t => [t, emptyPara()]),

    pageBreak(),

    // LISTE DES FIGURES
    heading1('LISTE DES FIGURES'),
    emptyPara(),
    ...[
      'Figure 1 : Évolution du taux de pénétration mobile au Sénégal',
      'Figure 2 : Répartition des commerces numériques en Afrique de l\'Ouest',
      'Figure 3 : Diagramme de cas d\u2019utilisation — Acteur Client',
      'Figure 4 : Diagramme de cas d\u2019utilisation — Acteur Vendeur',
      'Figure 5 : Diagramme de cas d\u2019utilisation — Acteur Livreur',
      'Figure 6 : Diagramme de cas d\u2019utilisation — Acteur Caissier',
      'Figure 7 : Diagramme de cas d\u2019utilisation — Acteur Administrateur',
      'Figure 8 : Diagramme de classes',
      'Figure 9 : Diagramme dactivité — Processus dinscription et validation',
      'Figure 10 : Diagramme dactivité — Processus de passer commande',
      'Figure 11 : Diagramme dactivité — Processus de livraison',
      'Figure 12 : Architecture globale du système SENFOIRE',
      'Figure 13 : Schéma de la base de données',
      'Figure 14 : Architecture de déploiement',
    ].map(f => para(f)),

    pageBreak(),

    // LISTE DES TABLEAUX
    heading1('LISTE DES TABLEAUX'),
    emptyPara(),
    ...[
      'Tableau 1 : Évolution du e-commerce au Sénégal (2019-2025)',
      'Tableau 2 : Comparaison des solutions existantes',
      'Tableau 3 : Identification des acteurs du système',
      'Tableau 4 : Besoins fonctionnels par acteur',
      'Tableau 5 : Besoins non fonctionnels',
      'Tableau 6 : Technologies retenues et justifications',
      'Tableau 7 : Environnement de développement',
      'Tableau 8 : Rôles et permissions dans SENFOIRE',
      'Tableau 9 : Résultats des tests fonctionnels',
      'Tableau 10 : Estimation financière du prototype',
      'Tableau 11 : Comparaison avec les solutions existantes',
    ].map(t => para(t)),

    pageBreak(),

    // LISTE DES CAPTURES
    heading1('LISTE DES CAPTURES'),
    emptyPara(),
    ...[
      'Capture 1 : Page daccueil — Landing page SENFOIRE',
      'Capture 2 : Page de connexion',
      'Capture 3 : Choix du rôle lors de l\'inscription',
      'Capture 4 : Formulaire dinscription client',
      'Capture 5 : Formulaire dinscription vendeur',
      'Capture 6 : Formulaire dinscription livreur',
      'Capture 7 : Page dattente de validation admin',
      'Capture 8 : Configuration des identifiants après approbation',
      'Capture 9 : Réinitialisation du mot de passe',
      'Capture 10 : Tableau de bord client — Vue catalogue',
      'Capture 11 : Détail dun produit',
      'Capture 12 : Panier et validation de commande',
      'Capture 13 : Sélection du mode de paiement',
      'Capture 14 : Suivi de commande en temps réel',
      'Capture 15 : Carte de fidélité client',
      'Capture 16 : Liste des favoris',
      'Capture 17 : Messagerie client-admin',
      'Capture 18 : Tableau de bord vendeur — Statistiques',
      'Capture 19 : Gestion des produits vendeur',
      'Capture 20 : Édition dun produit',
      'Capture 21 : Édition du stand vendeur',
      'Capture 22 : Commandes reçues vendeur',
      'Capture 23 : Tableau de bord livreur — Livraisons disponibles',
      'Capture 24 : Livraison en cours avec suivi GPS',
      'Capture 25 : Historique des livraisons livreur',
      'Capture 26 : Tableau de bord caissier — Commandes en attente',
      'Capture 27 : Validation dun paiement caissier',
      'Capture 28 : Historique des paiements caissier',
      'Capture 29 : Tableau de bord admin — Statistiques globales',
      'Capture 30 : Gestion des utilisateurs admin',
      'Capture 31 : Gestion des inscriptions admin',
      'Capture 32 : Gestion des catégories admin',
      'Capture 33 : Gestion des codes promo admin',
      'Capture 34 : Vue catalogue visiteur (sans authentification)',
      'Capture 35 : Interface multilingue (Wolof)',
      'Capture 36 : Indicateur mode hors-ligne',
    ].map(c => para(c)),

    pageBreak(),
  ],
});

// ============ MAIN BODY ============
const mainChildren = [];

// INTRODUCTION GENERALE
mainChildren.push(heading2('INTRODUCTION GÉNÉRALE'));
mainChildren.push(emptyPara());
mainChildren.push(para('Le Sénégal connaît depuis plusieurs années une transformation numérique accélérée, portée par une pénétration mobile qui dépasse les 120 % et par l\'émergence croissante des services de paiement mobile tels que Wave et Orange Money. Cette dynamique a favorisé l\'émergence de nombreuses plateformes de commerce en ligne, notamment dans le secteur de la grande distribution avec des acteurs tels que Jumia et Amazon. Cependant, les commerçants traditionnels des marchés — qui constituent l\'épine dorsale de l\'économie sénégalaise — peinent à intégrer ces outils numériques en raison de barrières techniques, financières et organisationnelles.', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(para('C\'est dans ce contexte qu\'a émergé le projet SENFOIRE (Sénégal Foire Internationale), une plateforme de commerce en ligne multi-vendeurs qui ambitionne de reproduire numériquement l\'expérience du marché traditionnel sénégalais. Chaque vendeur dispose dun « stand » virtuel géré de manière autonome, tandis que la plateforme centralise les commandes, les paiements, la livraison et la gestion administrative.', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(para('Le présent mémoire s\'inscrit dans le cadre de la fin détudes en Développement dApplications Réparties à l\'École Supérieure Multinationale des Télécommunications (ESMT). Il a pour objet la conception, le développement et la mise en place de la plateforme SENFOIRE. Notre problématique centrale est la suivante : **comment concevoir et implémenter une plateforme de commerce en ligne multi-vendeurs capable de fidéliser les commerçants traditionnels sénégalais tout en offrant aux clients une expérience dachat fluide, sécurisée et adaptée au contexte local ?**', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(para('Pour répondre à cette problématique, ce mémoire s\'articule autour de cinq chapitres :', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(para('• Le **Chapitre I** présente le contexte général du projet, la problématique identifiée, un état de l\'art des solutions existantes et les objectifs de l\'étude.'));
mainChildren.push(para('• Le **Chapitre II** détaille la conception fonctionnelle, incluant l\'analyse des besoins fonctionnels et non fonctionnels, ainsi que la modélisation UML du système.'));
mainChildren.push(para('• Le **Chapitre III** expose l\'architecture logicielle retenue, les technologies choisies et les justifications associées.'));
mainChildren.push(para('• Le **Chapitre IV** décrit l\'environnement de développement, l\'organisation du projet et l\'implémentation des différents modules de la solution SENFOIRE.'));
mainChildren.push(para('• Le **Chapitre V** présente les résultats obtenus, une discussion critique de la solution proposée et les perspectives damélioration.'));
mainChildren.push(pageBreak());

// ============ CHAPITRE I ============
mainChildren.push(heading2('CHAPITRE I : PRÉSENTATION GÉNÉRALE'));
mainChildren.push(emptyPara());

mainChildren.push(heading3('1.1 Introduction'));
mainChildren.push(para('Ce premier chapitre vise à poser le cadre général dans lequel s\'inscrit le projet SENFOIRE. Nous y présentons le contexte socio-économique et technologique au Sénégal, la problématique à laquelle répond notre étude, un état de l\'art des solutions existantes, ainsi que les objectifs que nous nous sommes fixés.', { indent: true }));

mainChildren.push(heading3('1.2 Contexte Général'));
mainChildren.push(heading4('1.2.1 La transformation numérique au Sénégal'));
mainChildren.push(para('Le Sénégal figure parmi les pays africains les plus avancés en matière de transformation numérique. Le pays compte plus de 23 millions dabonnés mobiles pour une population denviron 18 millions dhabitants, soit un taux de pénétration mobile de 120 %. Parallèlement, 8,7 millions de Sénégalais sont connectés à Internet, représentant environ 49 % de la population.', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(capturePlaceholder('Figure 1 : Évolution du taux de pénétration mobile au Sénégal'));
mainChildren.push(emptyPara());
mainChildren.push(para('L\'adoption massive des services de paiement mobile a constitué un levier majeur. Wave, lancé au Sénégal en 2018, a connu une croissance fulgurante avec plus de 8 millions dutilisateurs actifs. Orange Money, pioneer du secteur, dispose dune base installée comparable. Ces deux plateformes de paiement mobile représentent aujourdhui plus de 70 % des transactions financières au quotidien au Sénégal.', { indent: true }));

mainChildren.push(heading4('1.2.2 Le commerce traditionnel face au numérique'));
mainChildren.push(para('Malgré cette dynamique numérique, le commerce traditionnel reste le pilier de l\'économie sénégalaise. Plus de 80 % du commerce de détail est exercé dans les marchés traditionnels et les petits commerces. Ces commerçants — estimés à plus de 200 000 dans la région de Dakar seule — constituent un réservoir économique considérable qui n\'a pas encore été pleinement intégré à l\'économie numérique.', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(para('Plusieurs facteurs freinent cette intégration :', { indent: true }));
mainChildren.push(para('• **La barrière technique** : la majorité des commerçants ne maîtrisent pas les outils numériques et n\'ont pas les compétences pour créer ou gérer une boutique en ligne.'));
mainChildren.push(para('• **La barrière financière** : le coût de création et de maintenance dun site e-commerce indépendant est prohibitif pour la plupart des petits commerçants.'));
mainChildren.push(para('• **L\'absence de solutions adaptées** : les plateformes existantes (Jumia, Amazon) sont conçues pour des vendeurs professionnels et ne prennent pas en compte les spécificités du commerce traditionnel sénégalais.'));

mainChildren.push(heading4('1.2.3 Le concept de la foire numérique'));
mainChildren.push(para('La foire commerciale est une institution ancienne au Sénégal. Des événements comme la Foire Internationale de Dakar (FIDAK) ou la Foire des Pairs attirent chaque année des milliers de commerçants et de visiteurs. Le concept de SENFOIRE consiste à reproduire cette expérience de foire dans un environnement numérique : chaque vendeur dispose dun stand virtuel, les visiteurs peuvent circuler entre les stands, et la plateforme assure les services transversaux (paiement, livraison, service après-vente).', { indent: true }));

mainChildren.push(heading3('1.3 Problématique'));
mainChildren.push(heading4('1.3.1 Une fracture numérique persistante dans le petit commerce'));
mainChildren.push(para('Malgré les avancées technologiques, une fracture numérique persiste entre les grandes enseignes du e-commerce et les petits commerçants traditionnels. Les principales difficultés identifiées sont :', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(para('1. **L\'isolement technologique** : chaque commerçant devrait théoriquement créer sa propre boutique en ligne, ce qui nécessite des compétences techniques dont ils ne disposent pas.'));
mainChildren.push(para('2. **L\'absence de mutualisation** : sans plateforme commune, les commerçants ne peuvent pas partager les coûts dinfrastructure ni bénéficier dune clientèle mutualisée.'));
mainChildren.push(para('3. **La méfiance envers le paiement numérique** : bien que Wave et Orange Money soient largement adoptés pour les transferts personnels, de nombreux commerçants hésitent à les intégrer dans leur processus de vente en ligne.'));
mainChildren.push(para('4. **La logistique de livraison** : l\'absence dun réseau de livraison fiable et abordable constitue un obstacle majeur.'));

mainChildren.push(heading4('1.3.2 État de l\'art : analyse des solutions existantes'));
mainChildren.push(para('Afin de mieux cerner les besoins et didentifier les lacunes des solutions actuelles, nous avons réalisé une analyse comparative des principales plateformes de commerce en ligne disponibles au Sénégal et en Afrique.', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(capturePlaceholder('Tableau 2 : Comparaison des solutions existantes'));
mainChildren.push(emptyPara());
mainChildren.push(para('Les enseignements tirés de cette analyse sont les suivants :', { indent: true }));
mainChildren.push(para('• Les plateformes existantes sont conçues pour des vendeurs professionnels et ne prennent pas en compte les réalités des petits commerçants.'));
mainChildren.push(para('• Aucune solution ne propose un modèle de « stand virtuel » où le vendeur gère de manière autonome son espace.'));
mainChildren.push(para('• La fidélisation des clients et des vendeurs n\'est pas prise en compte de manière structurée.'));
mainChildren.push(para('• La livraison n\'est pas intégrée de manière native dans les plateformes existantes.'));

mainChildren.push(heading4('1.3.3 Problématique de l\'étude'));
mainChildren.push(para('Face à ces constats, notre problématique de recherche se formule comme suit :', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(para('**Comment concevoir et implémenter une plateforme de commerce en ligne multi-vendeurs capable de fidéliser les commerçants traditionnels sénégalais tout en offrant aux clients une expérience dachat fluide, sécurisée et adaptée au contexte local ?**'));
mainChildren.push(emptyPara());
mainChildren.push(para('De cette problématique centrale découlent les questions de recherche suivantes :', { indent: true }));
mainChildren.push(para('1. Quel modèle architectural permet de concilier l\'autonomie des vendeurs et la centralisation des services transversaux ?'));
mainChildren.push(para('2. Comment intégrer les modes de paiement mobile de manière sécurisée tout en assurant le fractionnement automatique des paiements ?'));
mainChildren.push(para('3. Comment mettre en place un réseau de livraison fiable et traçable au sein dune plateforme multi-vendeurs ?'));
mainChildren.push(para('4. Quels mécanismes de fidélisation mettre en œuvre pour encourager la récurrence des achats ?'));

mainChildren.push(heading3('1.4 Objectifs de l\'étude'));
mainChildren.push(heading4('1.4.1 Objectif général'));
mainChildren.push(para('L\'objectif général de ce travail est de concevoir, développer et mettre en place une plateforme de commerce en ligne multi-vendeurs — SENFOIRE — capable de reproduire numériquement l\'expérience de la foire commerciale traditionnelle, en offrant aux commerçants un espace de vente autonome et aux clients une expérience dachat fluide et sécurisée.', { indent: true }));

mainChildren.push(heading4('1.4.2 Objectifs spécifiques'));
mainChildren.push(para('Les objectifs spécifiques de cette étude sont les suivants :', { indent: true }));
mainChildren.push(para('1. **Analyser les besoins** des différents acteurs du système et modéliser les processus métier à l\'aide dUML.'));
mainChildren.push(para('2. **Concevoir une architecture logicielle** respectant le principe de séparation des responsabilités (MVC).'));
mainChildren.push(para('3. **Implémenter un module dinscription et dauthentification** sécurisé, intégrant un workflow de validation par l\'administrateur.'));
mainChildren.push(para('4. **Développer un module de gestion des stands et des produits**, permettant aux vendeurs de gérer de manière autonome leur espace commercial.'));
mainChildren.push(para('5. **Mettre en place un système de commande et de paiement** intégrant Wave et Orange Money avec split payment.'));
mainChildren.push(para('6. **Implémenter un réseau de livraison** avec géolocalisation en temps réel et calcul automatique des frais.'));
mainChildren.push(para('7. **Développer un programme de fidélité** basé sur un système de points et de niveaux.'));
mainChildren.push(para('8. **Réaliser une interface responsive et multilingue** (français, anglais, wolof).'));

mainChildren.push(heading3('1.5 Conclusion'));
mainChildren.push(para('Ce premier chapitre a permis de poser le cadre général du projet SENFOIRE. Nous avons présenté le contexte de la transformation numérique au Sénégal, identifié la problématique de l\'exclusion des petits commerçants du commerce en ligne, réalisé un état de l\'art des solutions existantes et défini nos objectifs de recherche. Le chapitre suivant sera consacré à la conception fonctionnelle du système, incluant l\'analyse détaillée des besoins et la modélisation UML.', { indent: true }));
mainChildren.push(pageBreak());

// ============ CHAPITRE II ============
mainChildren.push(heading2('CHAPITRE II : CONCEPTION FONCTIONNELLE'));
mainChildren.push(emptyPara());

mainChildren.push(heading3('2.1 Introduction'));
mainChildren.push(para('Ce chapitre présente la conception fonctionnelle de la plateforme SENFOIRE. Nous y détaillons l\'analyse des besoins des différents acteurs, la modélisation UML du système, incluant les diagrammes de cas dutilisation, le diagramme de classes et les diagrammes dactivités.', { indent: true }));

mainChildren.push(heading3('2.2 Analyse des besoins'));
mainChildren.push(heading4('2.2.1 Identification des acteurs'));
mainChildren.push(para('La plateforme SENFOIRE s\'adresse à cinq catégories dutilisateurs, chacune disposant de droits et de fonctionnalités spécifiques.', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(capturePlaceholder('Tableau 3 : Identification des acteurs du système'));
mainChildren.push(emptyPara());

mainChildren.push(heading4('2.2.2 Besoins fonctionnels'));
mainChildren.push(heading5('2.2.2.1 Pour le Client'));
mainChildren.push(para('Le client est l\'utilisateur central de la plateforme. Ses besoins fonctionnels couvrent l\'ensemble du parcours dachat :', { indent: true }));
mainChildren.push(para('• **Inscription et authentification** : s\'inscrire rapidement, se connecter avec un identifiant unique, réinitialiser son mot de passe.'));
mainChildren.push(para('• **Consultation et sélection de produits** : parcourir le catalogue, rechercher par nom/catégorie/stand, consulter les détails, gérer les favoris, comparer des produits.'));
mainChildren.push(para('• **Gestion du panier et commande** : ajouter des produits avec quantité et recommandations, appliquer des codes promo, utiliser les points de fidélité, choisir le mode de paiement.'));
mainChildren.push(para('• **Suivi de commande et livraison** : suivre le statut, localiser le livreur en temps réel, télécharger la facture PDF, noter le livreur.'));
mainChildren.push(para('• **Communication et fidélité** : échanger des messages, consulter les points de fidélité, les échanger contre des réductions.'));

mainChildren.push(heading5('2.2.2.2 Pour le Vendeur'));
mainChildren.push(para('Le vendeur gère son espace commercial sur la plateforme :', { indent: true }));
mainChildren.push(para('• **Gestion du stand** : modifier les informations du stand (nom, description, logo, localisation GPS).'));
mainChildren.push(para('• **Gestion des produits** : ajouter, modifier, supprimer des produits avec description, prix, stock et photos.'));
mainChildren.push(para('• **Gestion des commandes** : consulter les commandes contenant ses produits.'));
mainChildren.push(para('• **Statistiques et communication** : consulter son tableau de bord, échanger des messages.'));

mainChildren.push(heading5('2.2.2.3 Pour le Livreur'));
mainChildren.push(para('Le livreur assure la logistique de livraison :', { indent: true }));
mainChildren.push(para('• Consulter les livraisons disponibles et les accepter'));
mainChildren.push(para('• Mettre à jour le statut de la livraison'));
mainChildren.push(para('• Partager sa position GPS en temps réel'));
mainChildren.push(para('• Consulter son historique et ses points mensuels'));

mainChildren.push(heading5('2.2.2.4 Pour le Caissier'));
mainChildren.push(para('Le caissier valide les paiements et déclenche la logistique :', { indent: true }));
mainChildren.push(para('• Consulter les commandes en attente de validation'));
mainChildren.push(para('• Valider le paiement (vérification Wave/OM/espèces)'));
mainChildren.push(para('• Consulter l\'historique des paiements'));

mainChildren.push(heading5('2.2.2.5 Pour l\'Administrateur'));
mainChildren.push(para('L\'administrateur supervise l\'ensemble des opérations :', { indent: true }));
mainChildren.push(para('• **Gestion des utilisateurs** : liste, création de comptes, suppression.'));
mainChildren.push(para('• **Gestion des inscriptions** : approbation ou rejet des vendeurs et livreurs.'));
mainChildren.push(para('• **Gestion du catalogue** : CRUD des catégories et des codes promo.'));
mainChildren.push(para('• **Supervision et statistiques** : tableau de bord global, gestion des retours.'));

mainChildren.push(heading4('2.2.3 Besoins non fonctionnels'));
mainChildren.push(capturePlaceholder('Tableau 5 : Besoins non fonctionnels'));
mainChildren.push(emptyPara());

mainChildren.push(heading3('2.3 Modélisation UML'));
mainChildren.push(heading4('2.3.1 Présentation dUML'));
mainChildren.push(para('UML (Unified Modeling Language) est un langage de modélisation graphique standardisé utilisé pour la spécification, la visualisation, la construction et la documentation des artefacts dun système logiciel.', { indent: true }));

mainChildren.push(heading4('2.3.2 Présentation de l\'outil PlantUML'));
mainChildren.push(para('Pour la réalisation de nos diagrammes UML, nous avons utilisé **PlantUML**, un outil de modélisation textuelle qui permet de générer des diagrammes à partir de descriptions en langage semi-formel. PlantUML a été choisi pour sa facilité dutilisation, sa reproductibilité et sa capacité à intégrer les diagrammes dans des pipelines dautomatisation.', { indent: true }));

mainChildren.push(heading4('2.3.3 Diagrammes de cas dutilisation'));
mainChildren.push(para('Les diagrammes de cas dutilisation (DCU) modélisent les interactions entre les acteurs et le système.', { indent: true }));

mainChildren.push(heading5('2.3.3.1 Diagramme de cas dutilisation — Client'));
mainChildren.push(capturePlaceholder('Figure 3 : Diagramme de cas dutilisation — Acteur Client'));
mainChildren.push(emptyPara());
mainChildren.push(para('Le diagramme de cas dutilisation du client illustre les interactions principales : s\'inscrire, se connecter, consulter le catalogue, gérer le panier, passer une commande, suivre la livraison, noter et commenter, gérer les favoris, échanger des messages, consulter la fidélité et demander un retour.', { indent: true }));

mainChildren.push(heading5('2.3.3.2 Diagramme de cas dutilisation — Vendeur'));
mainChildren.push(capturePlaceholder('Figure 4 : Diagramme de cas dutilisation — Acteur Vendeur'));
mainChildren.push(emptyPara());
mainChildren.push(para('Le vendeur interagit avec la plateforme pour gérer son stand et ses produits : ajouter, modifier, supprimer des produits, consulter les commandes, les statistiques et échanger des messages.', { indent: true }));

mainChildren.push(heading5('2.3.3.3 Diagramme de cas dutilisation — Livreur'));
mainChildren.push(capturePlaceholder('Figure 5 : Diagramme de cas dutilisation — Acteur Livreur'));
mainChildren.push(emptyPara());
mainChildren.push(para('Les cas dutilisation du livreur couvrent le cycle de vie dune livraison : consulter les disponibilités, accepter, mettre à jour le statut, partager la localisation, consulter l\'historique et gérer la disponibilité.', { indent: true }));

mainChildren.push(heading5('2.3.3.4 Diagramme de cas dutilisation — Caissier'));
mainChildren.push(capturePlaceholder('Figure 6 : Diagramme de cas dutilisation — Acteur Caissier'));
mainChildren.push(emptyPara());
mainChildren.push(para('Le caissier intervient dans la validation des paiements : consulter les commandes en attente, valider un paiement et consulter l\'historique.', { indent: true }));

mainChildren.push(heading5('2.3.3.5 Diagramme de cas dutilisation — Administrateur'));
mainChildren.push(capturePlaceholder('Figure 7 : Diagramme de cas dutilisation — Acteur Administrateur'));
mainChildren.push(emptyPara());
mainChildren.push(para('L\'administrateur dispose des cas dutilisation les plus étendus : gestion des utilisateurs, des inscriptions, des catégories, des codes promo, consultation des statistiques, gestion des retours et création de comptes caissier.', { indent: true }));

mainChildren.push(heading4('2.3.4 Diagramme de classes'));
mainChildren.push(capturePlaceholder('Figure 8 : Diagramme de classes'));
mainChildren.push(emptyPara());

mainChildren.push(heading5('2.3.4.1 Principales entités'));
mainChildren.push(para('Le diagramme de classes de SENFOIRE comprend les entités suivantes :', { indent: true }));
mainChildren.push(para('**Entités centrales** : User (utilisateur), Stand (espace commercial), Produit (article à la vente), Categorie (classification des produits).'));
mainChildren.push(para('**Entités de commande** : Commande (achat), LigneDeCommande (détail), Paiement (enregistrement financier).'));
mainChildren.push(para('**Entités de livraison** : Livreur (profil), Livraison (enregistrement), LivreurRating (notation).'));
mainChildren.push(para('**Entités de communication** : Conversation (fil de discussion), Message (message), Notification (notification in-app).'));
mainChildren.push(para('**Entités transversales** : Favori, Avi (polymorphique), PromoCode, FideliteClient, FideliteHistorique, Inscription, Retour, CommandeRecurrente, PushSubscription, AlerteStock.'));

mainChildren.push(heading5('2.3.4.2 Choix de modélisation'));
mainChildren.push(para('Plusieurs choix de modélisation méritent dêtre soulignés :', { indent: true }));
mainChildren.push(para('1. **L\'unicomodalité du stand** : chaque vendeur ne peut posséder qu\'un seul stand (relation one-to-one), ce qui simplifie la gestion tout en reflétant la réalité du commerce traditionnel.'));
mainChildren.push(para('2. **L\'avis polymorphique** : le système davis utilise le mécanisme morphMany, permettant à un même avis de porter sur un produit ou un stand.'));
mainChildren.push(para('3. **Le paiement fractionné** : le modèle Paiement contient les champs part_vendeur et part_commission, assurant la traçabilité financière.'));
mainChildren.push(para('4. **La commande récurrente** : séparée de la commande classique, elle permet de gérer les achats répétitifs.'));

mainChildren.push(heading4('2.3.5 Diagrammes dactivités'));
mainChildren.push(heading5('2.3.5.1 Processus dinscription et validation'));
mainChildren.push(capturePlaceholder('Figure 9 : Diagramme dactivité — Processus dinscription et validation'));
mainChildren.push(emptyPara());
mainChildren.push(para('Le processus dinscription diffère selon le rôle : les clients sont automatiquement approuvés, tandis que les vendeurs et livreurs doivent être validés par l\'administrateur après vérification de leur CNI.', { indent: true }));

mainChildren.push(heading5('2.3.5.2 Processus de passer commande'));
mainChildren.push(capturePlaceholder('Figure 10 : Diagramme dactivité — Processus de passer commande'));
mainChildren.push(emptyPara());
mainChildren.push(para('Le processus de commande suit les étapes : sélection des produits, calcul des frais et réductions, choix du paiement, validation, fractionnement du paiement, création de la livraison, suivi et réception.', { indent: true }));

mainChildren.push(heading5('2.3.5.3 Processus de livraison'));
mainChildren.push(capturePlaceholder('Figure 11 : Diagramme dactivité — Processus de livraison'));
mainChildren.push(emptyPara());
mainChildren.push(para('Le processus de livraison s\'articule autour des interactions entre le caissier, le livreur et le client : création de la livraison disponible, acceptation par un livreur, partage GPS, remise et confirmation.', { indent: true }));

mainChildren.push(heading3('2.4 Conclusion'));
mainChildren.push(para('Ce chapitre a permis de réaliser la conception fonctionnelle complète de SENFOIRE. L\'analyse des besoins a identifié cinq acteurs distincts. La modélisation UML a produit sept diagrammes de cas dutilisation, un diagramme de classes avec 23 entités et trois diagrammes dactivités. Le chapitre suivant sera consacré à l\'architecture logicielle.', { indent: true }));
mainChildren.push(pageBreak());

// ============ CHAPITRE III ============
mainChildren.push(heading2('CHAPITRE III : ARCHITECTURE LOGICIELLE'));
mainChildren.push(emptyPara());

mainChildren.push(heading3('3.1 Introduction'));
mainChildren.push(para('Ce chapitre présente l\'architecture logicielle retenue pour SENFOIRE. Nous justifions les choix technologiques, décrivons l\'architecture globale et détaillons les différentes couches logicielles.', { indent: true }));

mainChildren.push(heading3('3.2 Choix de l\'architecture'));
mainChildren.push(heading4('3.2.1 Justification du modèle architectural'));
mainChildren.push(para('Nous avons retenu une **architecture client-serveur à API REST**, séparant clairement le frontend (React) du backend (Laravel). Ce choix se justifie par :', { indent: true }));
mainChildren.push(para('1. **Séparation des préoccupations** : le frontend et le backend évoluent indépendamment.'));
mainChildren.push(para('2. **Réutilisabilité de l\'API** : l\'API REST peut servir le web, une application mobile future et des tiers.'));
mainChildren.push(para('3. **Scalabilité** : le frontend et le backend peuvent être déployés et dimensionnés séparément.'));
mainChildren.push(para('4. **Écosystème riche** : Laravel et React disposent décosystèmes matures.'));

mainChildren.push(heading4('3.2.2 Avantages et limites du modèle choisi'));
mainChildren.push(para('**Avantages** : développement frontend et backend en parallèle, API documentée et testable, facilité dintégration de nouvelles interfaces, sécurité renforcée par la séparation des couches.', { indent: true }));
mainChildren.push(para('**Limites** : complexité initiale de mise en place, latence réseau (mitigée par le cache), nécessité de gérer la synchronisation des versions API.', { indent: true }));

mainChildren.push(heading3('3.3 Architecture globale du système'));
mainChildren.push(heading4('3.3.1 Schéma global'));
mainChildren.push(capturePlaceholder('Figure 12 : Architecture globale du système SENFOIRE'));
mainChildren.push(emptyPara());

mainChildren.push(heading4('3.3.2 Description des principales couches'));
mainChildren.push(heading5('3.3.2.1 Couche présentation (Frontend)'));
mainChildren.push(para('Développée en React 19 avec Vite 8 et Tailwind CSS 4. Elle comprend 5 tableaux de bord, un système de routes avec react-router-dom 7, un contexte dauthentification (AuthContext), un système dinternationalisation (I18nContext) et des services externes (Leaflet, Axios, Laravel Echo).', { indent: true }));

mainChildren.push(heading5('3.3.2.2 Couche logique métier (Backend)'));
mainChildren.push(para('Le backend Laravel 12 implémente 25 controllers, 3 services métier (CalculLivraison, FideliteService, NotificationService), 1 middleware (RoleMiddleware), 3 événements temps réel et 1 commande artisan pour les commandes récurrentes.', { indent: true }));

mainChildren.push(heading5('3.3.2.3 Couche persistance (Base de données)'));
mainChildren.push(capturePlaceholder('Figure 13 : Schéma de la base de données'));
mainChildren.push(emptyPara());
mainChildren.push(para('La base de données MySQL comprend 35 tables réparties en domaines : utilisateurs, catalogue, commandes, livraison, communication, fidélisation, inscription, retours, commandes récurrentes et infrastructure.', { indent: true }));

mainChildren.push(heading5('3.3.2.4 Couche sécurité et authentification'));
mainChildren.push(para('La sécurité repose sur : authentification par token (Sanctum), hachage Bcrypt, middleware de rôle, protection CSRF/XSS, validation côté serveur et vérification didentité (CNI).', { indent: true }));

mainChildren.push(heading5('3.3.2.5 Couche communication'));
mainChildren.push(para('La communication temps réel utilise Laravel Reverb (WebSocket, port 8080) avec trois événements broadcast : OrderStatusEvent, LocationUpdateEvent et NewMessageEvent, sur des canaux privés protégés.', { indent: true }));

mainChildren.push(heading3('3.4 Technologies retenues'));
mainChildren.push(capturePlaceholder('Tableau 6 : Technologies retenues et justifications'));
mainChildren.push(emptyPara());

mainChildren.push(heading4('3.4.1 Laravel (Backend)'));
mainChildren.push(para('Laravel 12 a été retenu pour son écosystème riche (Eloquent, Sanctum, Reverb, DomPDF), sa sécurité native, sa documentation extensive et la simplicité de son ORM Eloquent.', { indent: true }));

mainChildren.push(heading4('3.4.2 React (Frontend)'));
mainChildren.push(para('React 19 a été retenu pour son modèle composants réutilisables, le virtual DOM, l\'écosystème riche et la facilité dintégration avec les API REST.', { indent: true }));

mainChildren.push(heading4('3.4.3 MySQL (Base de données)'));
mainChildren.push(para('MySQL a été retenu pour sa fiabilité, sa performance, son intégration native avec Laravel et sa disponibilité sous XAMPP pour le développement.', { indent: true }));

mainChildren.push(heading4('3.4.4 Tailwind CSS (Style)'));
mainChildren.push(para('Tailwind CSS 4 a été retenu pour la rapidité de développement, la cohérence visuelle et l\'emballage léger.', { indent: true }));

mainChildren.push(heading4('3.4.5 Autres technologies'));
mainChildren.push(para('Laravel Sanctum (authentification), Laravel Reverb (WebSockets), DomPDF (factures PDF), Leaflet (cartes), Axios (HTTP), FCM (push notifications), PlantUML (modélisation).', { indent: true }));

mainChildren.push(heading3('3.5 Architecture de déploiement'));
mainChildren.push(heading4('3.5.1 Environnement de développement'));
mainChildren.push(capturePlaceholder('Tableau 7 : Environnement de développement'));
mainChildren.push(emptyPara());

mainChildren.push(heading4('3.5.2 Stratégie de test et qualité du code'));
mainChildren.push(para('La stratégie de test comprend des tests unitaires (modèles, services métier), des tests fonctionnels (endpoints API) et des tests de validation. Le linter oxlint est configuré côté frontend.', { indent: true }));

mainChildren.push(heading4('3.5.3 Architecture de production cible'));
mainChildren.push(capturePlaceholder('Figure 14 : Architecture de déploiement'));
mainChildren.push(emptyPara());
mainChildren.push(para('En production : frontend sur CDN (Netlify/Vercel), backend VPS avec Nginx + PHP-FPM, MySQL, Reverb pour les WebSockets, SSL via Let\' Encrypt, backup automatique cron daily.', { indent: true }));

mainChildren.push(heading3('3.6 Conclusion'));
mainChildren.push(para('Ce chapitre a présenté l\'architecture logicielle de SENFOIRE, justifié les choix technologiques et décrit les cinq couches du système. Le chapitre suivant détaillera l\'implémentation des différents modules.', { indent: true }));
mainChildren.push(pageBreak());

// ============ CHAPITRE IV ============
mainChildren.push(heading2('CHAPITRE IV : DÉVELOPPEMENT ET IMPLÉMENTATION'));
mainChildren.push(emptyPara());

mainChildren.push(heading3('4.1 Introduction'));
mainChildren.push(para('Ce chapitre constitue le cœur technique de ce mémoire. Nous y détaillons l\'environnement de développement, l\'organisation du projet, l\'implémentation de chaque module fonctionnel, les tests réalisés et les interfaces graphiques de SENFOIRE.', { indent: true }));

mainChildren.push(heading3('4.2 Environnement et outils de développement'));
mainChildren.push(heading4('4.2.1 Langages et frameworks'));
mainChildren.push(capturePlaceholder('Tableau 7 : Environnement de développement (détail)'));
mainChildren.push(emptyPara());

mainChildren.push(heading4('4.2.2 Outils de développement et de test'));
mainChildren.push(heading5('4.2.2.1 Visual Studio Code (VS Code)'));
mainChildren.push(para('VS Code a été utilisé comme éditeur principal avec les extensions PHP Intelephense, ES7+ React snippets, Tailwind CSS IntelliSense, GitLens et REST Client.', { indent: true }));

mainChildren.push(heading5('4.2.2.2 Postman'));
mainChildren.push(para('Postman a été utilisé pour les tests et la documentation des endpoints API. Chaque endpoint a été testé avec des données réelles avant l\'intégration frontend.', { indent: true }));

mainChildren.push(heading5('4.2.2.3 Git et GitHub'));
mainChildren.push(para('Le versioning a été assuré par Git avec hébergement sur GitHub. La stratégie de branches suit un modèle simplifié : main, develop et branches de feature.', { indent: true }));

mainChildren.push(heading5('4.2.2.4 XAMPP'));
mainChildren.push(para('XAMPP a fourni Apache, MySQL (port 3307) et PHP pour l\'environnement de développement local.', { indent: true }));

mainChildren.push(heading5('4.2.2.5 Outils de tests automatisés'));
mainChildren.push(para('PHPUnit pour les tests backend et oxlint pour le linting frontend.', { indent: true }));

mainChildren.push(heading3('4.3 Organisation du projet'));
mainChildren.push(heading4('4.3.1 Backend (Laravel)'));
mainChildren.push(para('Le backend suit la structure standard de Laravel avec Console/Commands, Events, Http/Controllers (25 controllers), Http/Middleware (RoleMiddleware), Models (23 modèles), Services (3 services métier), database/migrations (35 migrations), database/seeders, resources/views et routes/api (~100 routes).', { indent: true }));

mainChildren.push(heading4('4.3.2 Frontend (React)'));
mainChildren.push(para('Le frontend suit une architecture basée sur les rôles : components/ (dashboards et composants UI), context/ (AuthContext, I18nContext), locales/ (fr, en, wo), pages/ (Login, ChoixRole, formulaires dinscription, etc.), services/ (api, echo, offline, pushNotifications), App.jsx (routeur) et main.jsx (entrée).', { indent: true }));

mainChildren.push(heading3('4.4 Implémentation des modules'));
mainChildren.push(heading4('4.4.1 Module dauthentification et gestion des comptes'));
mainChildren.push(heading5('4.4.1.1 Inscription'));
mainChildren.push(para('Le module dinscription gère trois flux différents selon le rôle. Le client est immédiatement approuvé. Le vendeur et le livreur sont soumis à validation administrative avec vérification CNI.', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(para('Voici un extrait de code du controller dinscription :'));
mainChildren.push(...codeBlock(`// InscriptionController.php — Méthode store
public function store(Request $request)
{
    $validated = $request->validate([
        'nom' => 'required|string|max:255',
        'telephone' => 'required|string|unique:users,telephone',
        'email' => 'nullable|email|unique:users,email',
        'password' => 'required|string|min:6|confirmed',
        'role' => 'required|in:client,vendeur,livreur',
        'cni' => 'required_if:role,vendeur,livreur|string',
        'photo_cni' => 'required_if:role,vendeur,livreur|image|max:2048',
        'nom_stand' => 'required_if:role,vendeur|string',
    ]);

    if ($request->role === 'client') {
        $user = User::create([...]);
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'access_token' => $token,
            'user' => $user
        ], 201);
    }

    $inscription = Inscription::create([
        ...$validated,
        'statut' => 'en_attente',
        'password' => Hash::make($request->password),
    ]);

    return response()->json([
        'message' => 'Inscription soumise',
        'inscription_id' => $inscription->id
    ], 201);
}`));

mainChildren.push(heading5('4.4.1.2 Connexion'));
mainChildren.push(para('Le système de connexion accepte trois types didentifiants : email, téléphone ou pseudo. Cette flexibilité est essentielle dans le contexte sénégalais.', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(para('Voici un extrait de code du controller de connexion :'));
mainChildren.push(...codeBlock(`// AuthController.php — Méthode login
public function login(Request $request)
{
    $user = User::where('email', $request->identifiant)
        ->orWhere('telephone', $request->identifiant)
        ->orWhere('pseudo', $request->identifiant)
        ->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'message' => 'Identifiants incorrects'
        ], 401);
    }

    $token = $user->createToken('auth_token')->plainTextToken;
    return response()->json([
        'access_token' => $token,
        'user' => $user
    ]);
}`));

mainChildren.push(heading5('4.4.1.3 Réinitialisation du mot de passe'));
mainChildren.push(para('La réinitialisation suit un processus en trois étapes : envoi dun code à 6 chiffres par email, vérification du code, puis réinitialisation du mot de passe avec une clé de réinitialisation.', { indent: true }));

mainChildren.push(heading4('4.4.2 Module de gestion des stands et produits'));
mainChildren.push(para('Le module implémente le CRUD complet avec création (nom, description, prix, stock, catégorie, photos en JSON), modification, suppression et activation/désactivation de la visibilité. Le stock est automatiquement décrémenté lors de la validation dune commande.', { indent: true }));

mainChildren.push(para('Voici un extrait de code du controller de produits :'));
mainChildren.push(...codeBlock(`// ProduitController.php — Méthode store
public function store(Request $request)
{
    $validated = $request->validate([
        'nom' => 'required|string|max:255',
        'description' => 'required|string',
        'prix' => 'required|numeric|min:0',
        'stock' => 'required|integer|min:0',
        'categorie_id' => 'nullable|exists:categories,id',
        'photos.*' => 'image|max:2048',
    ]);

    $stand = auth()->user()->stand;
    $photos = [];
    if ($request->hasFile('photos')) {
        foreach ($request->file('photos') as $photo) {
            $photos[] = $photo->store('produits', 'public');
        }
    }

    $produit = Produit::create([
        ...$validated,
        'stand_id' => $stand->id,
        'photos' => $photos,
        'disponibilite' => true,
    ]);

    return response()->json($produit, 201);
}`));

mainChildren.push(heading4('4.4.3 Module de commande et paiement'));
mainChildren.push(heading5('4.4.3.1 Création de commande'));
mainChildren.push(para('La création de commande intègre la validation du stock, le calcul des frais de livraison (Haversine), l\'application des codes promo, l\'utilisation des points de fidélité et le calcul de la commission (10 %).', { indent: true }));

mainChildren.push(heading5('4.4.3.2 Validation du paiement par le caissier'));
mainChildren.push(para('Lors de la validation, le paiement est enregistré avec le split payment (90 % vendeur, 10 % plateforme), la livraison est créée et les livreurs disponibles sont notifiés.', { indent: true }));

mainChildren.push(heading4('4.4.4 Module de livraison'));
mainChildren.push(heading5('4.4.4.1 Calcul des frais de livraison'));
mainChildren.push(para('Le calcul utilise la formule de Haversine avec un tarif de 100 FCFA/km, des frais supplémentaires de 500 FCFA par boutique et un minimum de 500 FCFA.', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(para('Voici un extrait de code du service de calcul :'));
mainChildren.push(...codeBlock(`// CalculLivraison.php
class CalculLivraison
{
    const TARIF_PAR_KM = 100;
    const FRAIS_BOUTIQUE = 500;
    const MINIMUM = 500;

    public static function calculer(User $client, array $items): float
    {
        $clientLat = $client->latitude;
        $clientLng = $client->longitude;
        if (!$clientLat || !$clientLng) return 0;

        $standsDistances = [];
        foreach ($items as $item) {
            $produit = Produit::find($item['produit_id']);
            $stand = $produit->stand;
            if ($stand->vendeur->latitude && $stand->vendeur->longitude) {
                $distance = self::haversine(
                    $clientLat, $clientLng,
                    $stand->vendeur->latitude,
                    $stand->vendeur->longitude
                );
                $standsDistances[$stand->id] = $distance;
            }
        }
        if (empty($standsDistances)) return 0;

        $maxDistance = max($standsDistances);
        $frais = $maxDistance * self::TARIF_PAR_KM;
        $nbBoutiques = count($standsDistances);
        if ($nbBoutiques > 1) {
            $frais += ($nbBoutiques - 1) * self::FRAIS_BOUTIQUE;
        }
        return max($frais, self::MINIMUM);
    }
}`));

mainChildren.push(heading5('4.4.4.2 Suivi GPS en temps réel'));
mainChildren.push(para('Le livreur partage sa position GPS via PUT /api/livreur/location. Chaque mise à jour est broadcast via LocationUpdateEvent sur le canal livreur-location.{commandeId}.', { indent: true }));

mainChildren.push(heading4('4.4.5 Module de fidélité'));
mainChildren.push(para('Le programme de fidélité attribue 1 point pour chaque 1 000 FCFA dépensés. 1 point = 10 FCFA de réduction. Quatre niveaux : Bronze (0+), Argent (50+, 2 %), Or (200+, 5 %), Diamant (500+, 10 %).', { indent: true }));

mainChildren.push(para('Voici un extrait du service de fidélité :'));
mainChildren.push(...codeBlock(`// FideliteService.php
class FideliteService
{
    const POINTS_PAR_1000_FCFA = 1;
    const VALEUR_POINT = 10;

    const NIVEAUX = [
        'bronze'  => ['seuil' => 0,   'reduction' => 0],
        'argent'  => ['seuil' => 50,  'reduction' => 2],
        'or'      => ['seuil' => 200, 'reduction' => 5],
        'diamant' => ['seuil' => 500, 'reduction' => 10],
    ];

    public static function attribuerPoints(
        int $clientId, float $montant, ?int $commandeId
    ): void {
        $points = floor($montant / 1000);
        if ($points <= 0) return;

        $fidelite = FideliteClient::firstOrCreate(
            ['client_id' => $clientId]
        );
        $fidelite->increment('points', $points);
        $fidelite->increment('total_points_gagnes', $points);
        $fidelite->niveau = self::calculerNiveau(
            $fidelite->total_points_gagnes
        );
        $fidelite->save();
    }
}`));

mainChildren.push(heading4('4.4.6 Module de messagerie'));
mainChildren.push(para('La messagerie permet la communication client-vendeur et client-administrateur. Les conversations peuvent être liées à une commande. Le temps réel est assuré via Laravel Reverb avec l\'événement NewMessageEvent.', { indent: true }));

mainChildren.push(heading4('4.4.7 Module de notifications'));
mainChildren.push(para('Le module gère deux canaux : notifications in-app (stockées en base, compteur de non-lues) et notifications push (FCM). Le service NotificationService crée la notification in-app et envoie simultanément la notification push.', { indent: true }));

mainChildren.push(heading4('4.4.8 Module dadministration'));
mainChildren.push(para('Le tableau de bord admin fournit : gestion des utilisateurs, des inscriptions (approbation/rejet avec CNI), des catégories, des codes promo, statistiques globales et gestion des retours.', { indent: true }));

mainChildren.push(heading3('4.5 Tests et validation'));
mainChildren.push(heading4('4.5.1 Tests unitaires'));
mainChildren.push(para('Tests des modèles Eloquent, des services métier (CalculLivraison, FideliteService) et du middleware RoleMiddleware.', { indent: true }));

mainChildren.push(heading4('4.5.2 Tests fonctionnels'));
mainChildren.push(capturePlaceholder('Tableau 9 : Résultats des tests fonctionnels'));
mainChildren.push(emptyPara());
mainChildren.push(para('Sept fichiers de tests couvrent l\'authentification, les catégories, les favoris, les messages, les codes promo, les avis et les litiges.', { indent: true }));

mainChildren.push(heading4('4.5.3 Tests utilisateurs'));
mainChildren.push(para('Les tests utilisateurs ont été réalisés auprès dun échantillon couvrant les cinq rôles avec les scénarios : inscription, connexion, parcours dachat, gestion de stand, livraison, validation de paiement et gestion administrative.', { indent: true }));

mainChildren.push(heading4('4.5.4 Tests de performance et de sécurité'));
mainChildren.push(para('Temps de réponse moyen < 500 ms, P95 < 900 ms. Vérifications de sécurité : refus de tokens invalides, blocage des accès non autorisés, validation des entrées, hachage des mots de passe.', { indent: true }));

mainChildren.push(heading3('4.6 Interfaces graphiques de la solution'));
mainChildren.push(para('Les interfaces de SENFOIRE sont présentées ci-dessous, organisées par rôle utilisateur.', { indent: true }));

mainChildren.push(heading4('4.6.1 Interfaces communes'));
mainChildren.push(capturePlaceholder('Capture 1 : Page daccueil — Landing page SENFOIRE'));
mainChildren.push(capturePlaceholder('Capture 2 : Page de connexion'));
mainChildren.push(capturePlaceholder('Capture 3 : Choix du rôle lors de l\'inscription'));
mainChildren.push(capturePlaceholder('Capture 4 : Formulaire dinscription client'));
mainChildren.push(capturePlaceholder('Capture 5 : Formulaire dinscription vendeur'));
mainChildren.push(capturePlaceholder('Capture 6 : Formulaire dinscription livreur'));
mainChildren.push(capturePlaceholder('Capture 7 : Page dattente de validation admin'));
mainChildren.push(capturePlaceholder('Capture 8 : Configuration des identifiants après approbation'));
mainChildren.push(capturePlaceholder('Capture 9 : Réinitialisation du mot de passe'));

mainChildren.push(heading4('4.6.2 Interfaces spécifiques aux Clients'));
mainChildren.push(capturePlaceholder('Capture 10 : Tableau de bord client — Vue catalogue'));
mainChildren.push(capturePlaceholder('Capture 11 : Détail dun produit'));
mainChildren.push(capturePlaceholder('Capture 12 : Panier et validation de commande'));
mainChildren.push(capturePlaceholder('Capture 13 : Sélection du mode de paiement'));
mainChildren.push(capturePlaceholder('Capture 14 : Suivi de commande en temps réel'));
mainChildren.push(capturePlaceholder('Capture 15 : Carte de fidélité client'));
mainChildren.push(capturePlaceholder('Capture 16 : Liste des favoris'));
mainChildren.push(capturePlaceholder('Capture 17 : Messagerie client-admin'));

mainChildren.push(heading4('4.6.3 Interfaces spécifiques aux Vendeurs'));
mainChildren.push(capturePlaceholder('Capture 18 : Tableau de bord vendeur — Statistiques'));
mainChildren.push(capturePlaceholder('Capture 19 : Gestion des produits vendeur'));
mainChildren.push(capturePlaceholder('Capture 20 : Édition dun produit'));
mainChildren.push(capturePlaceholder('Capture 21 : Édition du stand vendeur'));
mainChildren.push(capturePlaceholder('Capture 22 : Commandes reçues vendeur'));

mainChildren.push(heading4('4.6.4 Interfaces spécifiques aux Livreurs'));
mainChildren.push(capturePlaceholder('Capture 23 : Tableau de bord livreur — Livraisons disponibles'));
mainChildren.push(capturePlaceholder('Capture 24 : Livraison en cours avec suivi GPS'));
mainChildren.push(capturePlaceholder('Capture 25 : Historique des livraisons livreur'));

mainChildren.push(heading4('4.6.5 Interfaces spécifiques aux Caissiers'));
mainChildren.push(capturePlaceholder('Capture 26 : Tableau de bord caissier — Commandes en attente'));
mainChildren.push(capturePlaceholder('Capture 27 : Validation dun paiement caissier'));
mainChildren.push(capturePlaceholder('Capture 28 : Historique des paiements caissier'));

mainChildren.push(heading4('4.6.6 Interfaces spécifiques aux Administrateurs'));
mainChildren.push(capturePlaceholder('Capture 29 : Tableau de bord admin — Statistiques globales'));
mainChildren.push(capturePlaceholder('Capture 30 : Gestion des utilisateurs admin'));
mainChildren.push(capturePlaceholder('Capture 31 : Gestion des inscriptions admin'));
mainChildren.push(capturePlaceholder('Capture 32 : Gestion des catégories admin'));
mainChildren.push(capturePlaceholder('Capture 33 : Gestion des codes promo admin'));

mainChildren.push(heading4('4.6.7 Interfaces visiteur et multilingue'));
mainChildren.push(capturePlaceholder('Capture 34 : Vue catalogue visiteur (sans authentification)'));
mainChildren.push(capturePlaceholder('Capture 35 : Interface multilingue (Wolof)'));
mainChildren.push(capturePlaceholder('Capture 36 : Indicateur mode hors-ligne'));

mainChildren.push(heading3('4.7 Conclusion'));
mainChildren.push(para('Ce chapitre a présenté le développement de SENFOIRE : l\'environnement, l\'organisation, huit modules fonctionnels et les interfaces graphiques. Les tests valident le bon fonctionnement de la solution. Le chapitre suivant discutera les résultats.', { indent: true }));
mainChildren.push(pageBreak());

// ============ CHAPITRE V ============
mainChildren.push(heading2('CHAPITRE V : RÉSULTATS ET DISCUSSIONS'));
mainChildren.push(emptyPara());

mainChildren.push(heading3('5.1 Introduction'));
mainChildren.push(para('Ce dernier chapitre présente les résultats obtenus, discute de ces résultats en les comparant aux solutions existantes et analyse les forces, limites et perspectives de SENFOIRE.', { indent: true }));

mainChildren.push(heading3('5.2 Résultats techniques et fonctionnels'));
mainChildren.push(heading4('5.2.1 Résultats techniques'));
mainChildren.push(para('Les principaux résultats techniques : API REST complète (100+ routes), base de données (35 tables), authentification Sanctum, temps réel Reverb, programme de fidélité, calcul Haversine, 5 tableaux de bord, interface trilingue et PWA.', { indent: true }));

mainChildren.push(heading4('5.2.2 Justification des résultats obtenus'));
mainChildren.push(capturePlaceholder('Tableau 8 : Rôles et permissions dans SENFOIRE'));
mainChildren.push(emptyPara());
mainChildren.push(para('Chaque objectif spécifique fixé au Chapitre I a été atteint : analyse des besoins et UML, architecture MVC, inscription validée, stands/produits, commande/paiement, livraison GPS, fidélité et multilingue.', { indent: true }));

mainChildren.push(heading3('5.3 Discussion critique'));
mainChildren.push(heading4('5.3.1 Apports par rapport à l\'existant'));
mainChildren.push(capturePlaceholder('Tableau 11 : Comparaison avec les solutions existantes'));
mainChildren.push(emptyPara());

mainChildren.push(heading4('5.3.2 Points forts de la solution'));
mainChildren.push(para('1. **Adaptation au contexte sénégalais** : paiement mobile, multilingue (Wolof), validation CNI, modèle de foire virtuelle.'));
mainChildren.push(para('2. **Autonomie des vendeurs** : chaque vendeur gère son stand de manière indépendante.'));
mainChildren.push(para('3. **Logistique intégrée** : calcul automatique des frais, suivi GPS, réseau de livreurs.'));
mainChildren.push(para('4. **Fidélisation structurée** : programme de points et niveaux.'));
mainChildren.push(para('5. **Sécurité** : authentification par token, validation des inscriptions, hachage.'));
mainChildren.push(para('6. **Architecture modulaire** : facilité dajout de nouvelles fonctionnalités.'));

mainChildren.push(heading4('5.3.3 Limites et axes damélioration'));
mainChildren.push(para('1. **Paiement non automatisé** : le paiement repose sur une validation manuelle du caissier.'));
mainChildren.push(para('2. **Alertes stock non déclenchées** : le mécanisme dabonnement existe mais le déclenchement automatique n\'est pas implémenté.'));
mainChildren.push(para('3. **WebSockets non exploités** : les dashboards utilisent le polling au lieu des WebSockets.'));
mainChildren.push(para('4. **Mode hors-ligne limité** : la PWA est installable mais le mode dégradé est incomplet.'));
mainChildren.push(para('5. **Absence de tests frontend** : aucun test côté React.'));
mainChildren.push(para('6. **Litiges désactivés** : le module de litiges a été implémenté puis mis en pause.'));

mainChildren.push(heading4('5.3.4 Perspectives'));
mainChildren.push(para('1. **Intégration des API de paiement** : connexion directe aux API Wave et Orange Money.'));
mainChildren.push(para('2. **Application mobile** : développement en React Native ou Flutter.'));
mainChildren.push(para('3. **Intelligence artificielle** : recommandation de produits, détection de fraudes.'));
mainChildren.push(para('4. **Gestion avancée des litiges** : réactivation avec médiation automatisée.'));
mainChildren.push(para('5. **Analytics avancés** : tableaux de bord avec graphiques interactifs.'));
mainChildren.push(para('6. **Mode hors-ligne complet** : navigation catalogue et panier en mode dégradé.'));
mainChildren.push(para('7. **Connexion WebSocket** : remplacement du polling par les WebSockets.'));

mainChildren.push(heading4('5.3.5 Perspectives business'));
mainChildren.push(para('Le modèle économique repose sur : la commission de 10 %, des offres premium pour les vendeurs, la publicité ciblée et des services à valeur ajoutée (livraison express, emballage cadeau).', { indent: true }));

mainChildren.push(heading3('5.4 Estimation financière du projet'));
mainChildren.push(heading4('5.4.1 Estimation financière du prototype'));
mainChildren.push(capturePlaceholder('Tableau 10 : Estimation financière du prototype'));
mainChildren.push(emptyPara());
mainChildren.push(para('Le prototype a été développé dans le cadre académique. Le coût se limite au nom de domaine futur : ~15 000 FCFA/an.', { indent: true }));

mainChildren.push(heading4('5.4.2 Hypothèses pour une version professionnelle'));
mainChildren.push(para('100 vendeurs actifs, 1 000 clients mensuels, 500 commandes/mois, panier moyen 15 000 FCFA.', { indent: true }));

mainChildren.push(heading4('5.4.3 Coûts dexploitation'));
mainChildren.push(para('VPS : 15 000 FCFA/mois, domaine + SSL : 1 250 FCFA/mois, sauvegarde : 5 000 FCFA/mois, maintenance : 50 000 FCFA/mois. **Total : 71 250 FCFA/mois.**', { indent: true }));

mainChildren.push(heading4('5.4.4 Revenus projetés'));
mainChildren.push(para('Commission 10 % : 750 000 FCFA/mois. Offres premium : 200 000 FCFA/mois. **Total : 950 000 FCFA/mois.**', { indent: true }));

mainChildren.push(heading4('5.4.5 Rentabilité'));
mainChildren.push(para('Le projet serait rentable dès le premier mois, avec un bénéfice net estimé à **878 750 FCFA/mois**.', { indent: true }));

mainChildren.push(heading3('5.5 Conclusion'));
mainChildren.push(para('Ce chapitre a présenté les résultats de SENFOIRE. Les résultats techniques confirment la faisabilité de la solution. La discussion critique a mis en lumière les forces (adaptation locale, architecture modulaire, fidélité) et les limites (paiement manuel, WebSockets, PWA). Les perspectives damélioration ouvrent la voie à une évolution significative.', { indent: true }));
mainChildren.push(pageBreak());

// ============ CONCLUSION GENERALE ============
mainChildren.push(heading1('CONCLUSION GÉNÉRALE'));
mainChildren.push(emptyPara());
mainChildren.push(para('Le présent mémoire avait pour objet la conception et la mise en place de SENFOIRE, une plateforme de commerce en ligne multi-vendeurs reproduisant numériquement l\'expérience de la foire commerciale traditionnelle sénégalaise.', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(para('Au terme de ce travail, nous pouvons affirmer que les objectifs fixés ont été globalement atteints. La plateforme SENFOIRE offre un écosystème complet où cinq acteurs — clients, vendeurs, livreurs, caissiers et administrateurs — interagissent dans un environnement sécurisé et performant.', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(para('**Sur le plan conceptuel**, nous avons réalisé une analyse approfondie des besoins et une modélisation UML complète comprenant sept diagrammes de cas dutilisation, un diagramme de classes avec 23 entités et trois diagrammes dactivités.', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(para('**Sur le plan technique**, nous avons implémenté une solution moderne articulant Laravel 12, React 19 et MySQL. L\'API REST compte plus de 100 routes. Le temps réel est assuré par Laravel Reverb.', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(para('**Sur le plan fonctionnel**, SENFOIRE se distingue par : le modèle de stand virtuel autonome, le calcul Haversine, le programme de fidélité à quatre niveaux, le split payment automatique, l\'interface trilingue et le workflow dinscription avec validation CNI.', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(para('**Sur le plan économique**, l\'estimation financière montre la viabilité avec un coût de 71 250 FCFA/mois pour des revenus de 950 000 FCFA/mois, soit un bénéfice net de 878 750 FCFA/mois.', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(para('Toutefois, des limites subsistent : paiement mobile manuel, WebSockets inutilisés, PWA incomplète et tests frontend absents. Ces axes damélioration constituent les perspectives naturelles de l\'évolution de SENFOIRE.', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(para('Au-delà de l\'aspect technique, ce projet nous a permis de confronter les connaissances théoriques acquises à l\'ESMT aux réalités pratiques du développement logiciel. La gestion dun projet de cette envergure — de l\'analyse des besoins au déploiement — a été une expérience formatrice qui nous a préparé aux défis du métier de développeur dapplications réparties.', { indent: true }));
mainChildren.push(emptyPara());
mainChildren.push(para('Nous sommes convaincus que SENFOIRE a le potentiel de répondre à un besoin réel du marché sénégalais en offrant aux petits commerçants les outils numériques nécessaires pour rejoindre l\'économie du commerce en ligne, tout en préservant l\'esprit du commerce traditionnel.', { indent: true }));
mainChildren.push(pageBreak());

// ============ BIBLIOGRAPHIE ============
mainChildren.push(heading1('BIBLIOGRAPHIE'));
mainChildren.push(emptyPara());
const bibEntries = [
  '¹ DataReportal, « Digital 2025: Senegal », Janvier 2025. https://datareportal.com/reports/digital-2025-senegal',
  '² ANSD, « État de la population du Sénégal », 2024. https://www.ansd.sn',
  '³ Banque Mondiale, « Le système de paiement mobile au Sénégal », 2024. https://www.banquemondiale.org',
  '⁴ Ministère de l\'Économie du Numérique, « Plan Sénégal Numérique 2025 », 2023.',
  '⁵ OMG, « UML Specification, Version 2.5.1 », 2023. https://www.omg.org/spec/UML/',
  '⁶ Laravel Documentation, « Laravel 12.x ». https://laravel.com/docs/12.x',
  '⁷ React Documentation, « React ». https://react.dev',
  '⁸ Tailwind CSS Documentation. https://tailwindcss.com/docs',
  '⁹ PlantUML. https://plantuml.com',
  '¹⁰ Wave API Documentation. https://doc.wave.com',
  '¹¹ Orange Money API Documentation. https://developer.orange.com',
  '¹² Firebase Cloud Messaging. https://firebase.google.com/docs/cloud-messaging',
  '¹³ Leaflet.js. https://leafletjs.com',
  '¹⁴ Laravel Sanctum. https://laravel.com/docs/12.x/sanctum',
  '¹⁵ Laravel Reverb. https://laravel.com/docs/12.x/reverb',
];
bibEntries.forEach(entry => mainChildren.push(para(entry)));
mainChildren.push(pageBreak());

// ============ RESUME ============
mainChildren.push(heading1('RÉSUMÉ DU MÉMOIRE'));
mainChildren.push(emptyPara());
mainChildren.push(para('Ce mémoire présente la conception et la mise en place de SENFOIRE, une plateforme de commerce en ligne multi-vendeurs destinée aux commerçants sénégalais. Le projet consiste à reproduire numériquement l\'expérience de la foire commerciale traditionnelle en offrant à chaque vendeur un stand virtuel autonome. La solution intègre un système de commande avec paiement mobile (Wave, Orange Money), un réseau de livraison avec géolocalisation temps réel, un programme de fidélité à quatre niveaux et une interface trilingue (français, anglais, wolof). Développée avec Laravel 12, React 19 et MySQL, la plateforme comprend cinq tableaux de bord (client, vendeur, livreur, caissier, administrateur) et plus de 100 endpoints API. Les résultats démontrent la faisabilité et la viabilité économique dune telle plateforme dans le contexte sénégalais.', { indent: true }));
mainChildren.push(pageBreak());

// ============ ABSTRACT ============
mainChildren.push(heading1('ABSTRACT'));
mainChildren.push(emptyPara());
mainChildren.push(para('This memoir presents the design and implementation of SENFOIRE, a multi-vendor online marketplace platform designed for Senegalese merchants. The project aims to digitally replicate the traditional commercial fair experience by providing each vendor with an autonomous virtual booth. The solution integrates an ordering system with mobile payment (Wave, Orange Money), a delivery network with real-time geolocation, a four-tier loyalty program, and a trilingual interface (French, English, Wolof). Developed with Laravel 12, React 19, and MySQL, the platform includes five role-based dashboards (client, vendor, delivery person, cashier, administrator) and over 100 API endpoints. The results demonstrate the feasibility and economic viability of such a platform in the Senegalese context.', { indent: true }));

sections.push({
  properties: {
    page: {
      margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.2), right: convertInchesToTwip(1) },
    },
  },
  children: mainChildren,
});

const doc = new Document({
  creator: 'Mouhammad NDIAYE',
  title: 'SENFOIRE — Mémoire de fin détudes',
  description: 'Conception et mise en place dune plateforme de commerce en ligne multi-vendeurs',
  sections,
});

const buffer = await Packer.toBuffer(doc);
writeFileSync('C:/Users/mouha/OneDrive/Bureau/SENFOIRE/documentation Mouhammad/MEMOIRE_SENFOIRE.docx', buffer);
console.log('Document generated successfully!');

