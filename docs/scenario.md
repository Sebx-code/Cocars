# Le passager

Le jour du voyage, les passagers une fois dans le vehicule doivent signaler à travers l'application le fais qu'ils ont effectivement pris la route, ceux qui n'auront pas signaler seront considerer comme n'ayant pas pris la route et leurs argents sera restituer avec une penalite de 500.
si c'est le chauffeur qui est absent, l'argent est restituer en totalité au passager et le chauffeur perd en crédibilité(point = -1 étoile).
Le passager qui annule la reservation avant le jour de départ se voit restituer la totalité de son argent.
Le passager doit pouvoir mettre, modifier, supprimer sa photo de profil, sa bio, son contact, son adresse mail et son mot de passe( selon les mesures de securites ) et pouvoir devenir un chauffeur en ajoutant son vehicule

# Le chauffeur

Celui-ci publie un trajet, après la publication de son trajet, il devra accepter les réservations des passagers. Le jour du départ, le chauffeur dois valider le depart du véhicule en entrant le nombre de passager et cocher qui sont les passagers present dans le vehicule au moment du depart(code passager par trajet incrementer auto 1,2,3, ... en fonction du nombre auto de passager); le chauffeur encaisse l'argent des passagers qui ont valider le depart du vehicule avec -10% du total qui va a l'entreprise.Si le chauffeur est absent le jour du voyage celui ci perd 100 point de crédibilite et si le depart a lieu et gagne 50 points de credibilite et plus 10 points si les passagers lui donne bonne note ou plus 5 points si seulement une partie lui donne une bonne note. la position du trajet publier par un chauffeur depend de son nombre de points, plus il a de point plus il est en haut de la liste et a l'inverse moins il a des points plus il est en bas de la liste.
Le chauffeur dois pouvoir mettre, modifier, supprimer sa photo de profil, sa bio, son contact, son adresse mail, son mot de passe( selon les mesures de securites ); voire ses statistiques financieres avec filtre sur le temps, diagramme et chart moderne; Le chauffeur peut aussi résever un trajets mais d'un autre chauffeur, pas de lui meme(peut faire le meme chose qu'un passager).

# Gestionnaire

Celui-ci dois pour pouvoir :

- verifier, modifier, supprimer/bannir un utilisateur autre que lui meme(chauffeur/passager)
- voire les statistique financiere de l'entreprise et imprimer ou generer en .pdf un rapport
- voire la liste des utilisateurs taleau
- liste des reservations dansun tableau
- liste des trajet dans un tableau 
- Statistique global de l'entreprise