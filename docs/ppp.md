1) Contexte et justification
Dans la vie quotidienne, la mobilité représente une préoccupation majeure pour une partie importante de la population, en raison des difficultés d’accès à un transport régulier, du coût croissant des déplacements et des contraintes liées à l’attente. Il est fréquent que certains usagers, faute d’options immédiates, soient amenés à patienter longuement au bord des routes dans l’espoir de trouver un véhicule acceptant de les prendre, ce qui rend le déplacement incertain et pénible. De plus, dans les agences de transport, l’acquisition d’un ticket peut exiger de rester en rang pendant une durée importante, notamment lors des périodes de forte affluence, ce qui constitue une perte de temps et une contrainte supplémentaire. Dans ce contexte, le covoiturage apparaît comme une alternative potentiellement intéressante, car il peut répondre à des besoins de coût, de confort et de flexibilité, tout en offrant aux conducteurs une opportunité de rentabiliser leurs trajets. Cependant, cette pratique reste difficile à réaliser, car elle repose sur une coordination entre personnes qui ne se connaissent pas, et elle est marquée par plusieurs incertitudes, notamment sur la disponibilité des véhicules, la ponctualité, la fiabilité des engagements, la sécurité et les conditions financières du trajet. Ainsi, l’étude de cette problématique se justifie par la nécessité de comprendre et d’encadrer un mode de déplacement qui peut améliorer l’expérience de transport, tout en réduisant les risques et les désagréments associés à son organisation informelle.

2) Analyse fonctionnelle détaillée
2.1 Présentation générale du besoin

Au Cameroun, les déplacements urbains et interurbains sont souvent difficiles à cause de la congestion, du coût du transport et du manque d’organisation dans le covoiturage. Dans certaines zones, les passagers peuvent attendre plusieurs heures en autostop au bord de la route avant de trouver un véhicule acceptant de les prendre, ce qui rend le trajet incertain et fatigant. De plus, dans les agences de transport, l’achat d’un ticket nécessite parfois de rester longtemps en rang, ce qui fait perdre du temps et crée une expérience peu confortable. Dans ce contexte, la mise en place d’une application de covoiturage vise à améliorer l’organisation des déplacements en proposant une solution numérique permettant de rechercher un trajet, réserver une place et payer de manière sécurisée. Le projet CoCar répond à ce besoin en structurant la relation entre conducteurs et passagers, en améliorant la confiance et en créant aussi une opportunité économique, car les conducteurs peuvent rentabiliser leurs trajets en générant un revenu supplémentaire.

2.2 Acteurs du système

Le fonctionnement de l’application repose sur plusieurs acteurs qui interagissent avec la plateforme selon leurs besoins et leurs droits.

2.2.1 Visiteur

Le visiteur est un utilisateur non connecté. Il peut :

accéder à la page d’accueil (landing page) ;

consulter la liste des trajets disponibles ;

effectuer une recherche de trajets selon des critères ;

voir les détails d’un trajet ;

consulter le profil public d’un conducteur.

2.2.2 Utilisateur authentifié (rôle user)

Un utilisateur authentifié dispose d’un compte et peut agir de deux manières :

Conducteur : il peut proposer des trajets et gérer les réservations reçues.

Passager : il peut réserver une place, payer, confirmer le départ et laisser une note.

Un même utilisateur peut être conducteur sur un trajet et passager sur un autre.

2.2.3 Administrateur (rôle admin)

L’administrateur est responsable de la supervision du système. Il peut :

contrôler les activités sur la plateforme ;

modérer les trajets et réservations ;

gérer les utilisateurs ;

traiter la vérification d’identité.

2.3 Parcours fonctionnels clés
2.3.1 Parcours « Fil d’actualité » (visiteur / passager)

Ce parcours permet de faciliter l’accès rapide aux trajets récents, ce qui est utile dans un contexte où les passagers cherchent une solution immédiate au lieu d’attendre en autostop.

L’utilisateur ouvre le fil d’actualité via l’API.

La plateforme retourne les trajets récemment publiés.

Chaque trajet contient les informations principales :

conducteur,

informations du véhicule,

photos du véhicule,

informations du trajet (départ, destination, date, prix).

L’utilisateur peut ouvrir le détail du trajet puis démarrer une réservation.

2.3.2 Parcours « Rechercher & réserver »
Ce parcours correspond au scénario le plus fréquent : un passager souhaite voyager sans attendre longtemps en bord de route.

Le visiteur effectue une recherche de trajets .

Il consulte le détail d’un trajet.

S’il n’est pas connecté, il s’inscrit ou se connecte.

Il crée une réservation avec un statut initial pending.

Le conducteur reçoit la demande et décide :

confirmation ;

rejet.

Après confirmation, le passager peut payer :

via mobile money (orange_money, mtn_money, etc.).

En cas de paiement mobile money, le paiement est validé et placé en escrow ,

Le jour du voyage, les deux parties confirment le départ :

passager

conducteur

Une fois la confirmation faite par les deux :

le trajet est marqué comme démarré ,

l’argent est libéré vers le wallet du conducteur.

2.3.3 Parcours « Proposer un trajet » 

Ce parcours répond à l’objectif économique du covoiturage, car le conducteur peut gagner de l’argent en partageant les frais.

L’utilisateur authentifié ouvre l’écran de création de trajet.

Il saisit les informations :

départ et destination,

date et heure,

nombre de places,

prix,

préférences (ex : bagages, musique, etc.),

informations du véhicule.

Il publie le trajet.

Le système enregistre aussi les informations du véhicule .

2.3.4 Parcours « Gérer les réservations reçues »

Ce parcours permet au conducteur de contrôler les places disponibles et de réduire la gestion manuelle.

Le conducteur consulte les réservations reçues .

Pour une réservation pending, il peut :

confirmer ;

rejeter.

Lorsque la réservation est confirmée et payée :

le conducteur peut confirmer le départ ;

il peut aussi signaler un no-show (absence du passager).

2.3.5 Parcours « Annulation / remboursement / pénalités »

Ce parcours permet de limiter les conflits entre passagers et conducteurs.

Le passager peut annuler une réservation pending ou confirmed.

Si un paiement est en escrow :

remboursement total si l’annulation est faite avant le jour du voyage ;

remboursement partiel si l’annulation est tardive avec pénalité fixe de 500 FCFA.

Le conducteur peut signaler un no-show :

remboursement partiel du passager,

application de la pénalité.

2.3.6 Parcours « Wallet / Retrait »

Ce parcours est important car il permet au conducteur de récupérer son argent facilement, ce qui est adapté au contexte camerounais où les paiements mobiles sont très utilisés.

Consultation du solde wallet .

Retrait des fonds  :

montant minimum : 500 FCFA,

choix du provider,

saisie du numéro.

2.3.7 Parcours « Messagerie temps réel »

La messagerie est utile pour éviter les incompréhensions sur le lieu de rendez-vous ou l’heure, surtout dans les zones où les repères ne sont pas toujours précis.

Création ou récupération de conversation.

Lecture des messages.

Envoi d’un message .

Indicateur de saisie .

Communication temps réel via WebSocket :

canal privé.

2.3.8 Parcours « Notifications temps réel »

Les notifications améliorent le suivi des actions importantes (confirmation, annulation, rappel).

Stockage en base via table notifications.

Temps réel via WebSocket sur canal privé

2.3.9 Parcours « Vérification d’identité »

Ce module vise à renforcer la confiance et réduire les risques d’arnaques.

Envoi de documents :

carte d’identité,

selfie,

permis (optionnel).

Vérification du numéro de téléphone :

envoi code 

validation 

Traitement par l’administrateur :

approbation 

rejet

2.4 Règles métier transverses

Les règles métier garantissent la cohérence du système et évitent les abus.

Un passager ne peut pas réserver son propre trajet.

Un utilisateur ne peut pas avoir deux réservations actives sur le même trajet.

Une réservation doit être confirmée avant de pouvoir être payée.

En cas de paiement mobile money, l’argent reste en escrow jusqu’à confirmation du départ par les deux parties.

Une annulation le jour du voyage ou après entraîne une pénalité fixe de 500 FCFA.

2.5 Rôle et responsabilités de l’administrateur

L’administrateur dispose d’un accès protégé par AdminMiddleware. Il a pour rôle principal de garantir le bon fonctionnement de la plateforme.

Ses fonctions principales sont :

consulter les statistiques et l’activité générale ;

gérer la liste des utilisateurs et vérifier leurs informations ;

supprimer un utilisateur si nécessaire (avec annulation des trajets/réservations actives) ;

modérer les trajets et réservations ;

traiter les demandes de vérification d’identité.