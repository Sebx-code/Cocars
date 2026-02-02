1) Contexte et justification
Au Cameroun, la mobilité urbaine et interurbaine constitue un défi important pour de nombreux usagers, notamment à cause de la congestion routière, de l’augmentation du coût du transport, et du manque de solutions fiables pour organiser les déplacements. Dans plusieurs villes et sur certains axes routiers, il arrive que des personnes soient obligées de pratiquer l’autostop et d’attendre pendant des heures au bord de la route avant de trouver un véhicule acceptant le covoiturage, ce qui entraîne une perte de temps, de l’incertitude et parfois des risques liés à la sécurité. Par ailleurs, dans les agences de transport, l’achat d’un ticket peut devenir pénible, car les usagers doivent souvent se mettre en rang et patienter longtemps avant d’être servis, surtout en période de forte affluence. Face à cette situation, ce projet consiste à concevoir et réaliser une application web de covoiturage appelée CoCar, dont l’objectif est de structurer et faciliter la mise en relation entre conducteurs et passagers à travers une plateforme centralisée. L’application permet de consulter et rechercher des trajets, d’effectuer des réservations de manière traçable, et de renforcer la confiance grâce à un système de paiement sécurisé basé sur un mécanisme d’escrow. De plus, CoCar offre une opportunité économique, car le covoiturage peut permettre aux conducteurs de générer un revenu complémentaire en rentabilisant leurs déplacements, tout en proposant aux passagers une solution plus pratique et parfois moins coûteuse. Enfin, l’application intègre des fonctionnalités essentielles comme l’authentification, la gestion des trajets et réservations, les notifications, la messagerie en temps réel, la notation et la vérification d’identité, ainsi qu’un espace d’administration, le tout développé avec Laravel 11 pour le backend et React TypeScript avec TailwindCSS pour le frontend.

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