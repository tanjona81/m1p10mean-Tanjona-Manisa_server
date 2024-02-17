const Manager = require('../../schemas/ManagerSchema.js')
const Rendezvous = require('../../schemas/RendezvousSchema.js')
const RdvTracking = require('../../schemas/RendezvoustrackingSchema.js')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const login = async (nom, mdp) => {
    const user = await Manager.findOne({nom:nom})
    const test = await bcrypt.compare(mdp, user.mdp)
    if(test) {
        const usertoken = {
            _id : user._id,
            nom : user.nom
        }
        const accessToken = jwt.sign(usertoken,"secret")
        return accessToken;
    }
    else return null;
}

const getAll = async () => {
    return await Manager.find();
}

const getById = async (id) => {
    return await Manager.findOne({_id : id});
}

const create = async (nom, mdp) =>  {
    // Generate a salt
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    // Hash the password using the generated salt
    const hashedmdp = await bcrypt.hash(mdp, salt);

    let manager = new Manager();
    manager.nom = nom
    manager.mdp = hashedmdp
    return await manager.save()
}

const update = async (id, nom, mdp) => {
    let manager = await Manager.findById(id)
    if(nom !== undefined) manager.nom=nom
    if(mdp !== undefined) {
        // Generate a salt
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);

        // Hash the password using the generated salt
        const hashedmdp = await bcrypt.hash(mdp, salt);
        employe.mdp = hashedmdp
    }
    return await manager.save()
}

const delete_manager = async (id) => {
    return await Manager.deleteOne({ _id : id });
}

const getTempsMoyenTravailPourChaqueEmpoye = async () => {
    return Rendezvous.aggregate([
        {
            $match:{
                is_valid: 1
            }
        },
        {
            $lookup: {
                from: 'services',
                localField: 'id_service',
                foreignField: '_id',
                as: 'service'
            }
        },
        {
            $unwind: { path: "$service" }
        },
        {
            $group:{
                _id: "$id_employe",
                moyenne: { $avg: "$service.duree" }
            }
        },
        {
            $project: {
                _id: "$_id",
                moyenne: 1
            }
        }
    ])
}

const nbrReservation_jour = async () => {
    return await RdvTracking.aggregate([
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                count: { $sum: 1 }
             }
        }
    ])
}

const nbrReservation_mois = async () => {
    return await RdvTracking.aggregate([
        {
            $group: {
                _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                count: { $sum: 1 }
             }
        }
    ])
}

const chiffreAffaire_jour = async () => {
    return await Rendezvous.aggregate([
        {
            $match: {
                is_valid: 1
            }
        },
        {
            $lookup: {
                from: 'services',
                localField: 'id_service',
                foreignField: '_id',
                as: 'service'
            }
        },
        {
            $unwind: { path: "$service" }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date_heure" } },
                chiffre: {
                    $sum: "$service.prix"
                }
                // chiffre: { 
                //     $sum: { 
                //         $subtract: [
                //             "$service.prix", 
                //             {
                //                 $multiply: [
                //                     "$service.prix", 
                //                     { 
                //                         $divide: [
                //                         "$service.commission", 
                //                         100
                //                         ] 
                //                     }
                //                 ]
                //             }
                //         ]
                //     } 
                // }
            }
        }
    ])
}

const chiffreAffaire_mois = async () => {
    return await Rendezvous.aggregate([
        {
            $match: {
                is_valid: 1
            }
        },
        {
            $lookup: {
                from: 'services',
                localField: 'id_service',
                foreignField: '_id',
                as: 'service'
            }
        },
        {
            $unwind: { path: "$service" }
        },
        {
            $group: {
                _id: { year: { $year: '$date_heure' }, month: { $month: '$date_heure' } },
                chiffre: {
                    $sum: "$service.prix"
                }
                // chiffre: { $sum: { $subtract: ["$service.prix", {$multiply: ["$service.prix", { $divide: ["$service.commission", 100] }] }]} }
            }
        }
    ])
}

const beneficeparmois = async (mois, loyer, piece, autres) => {
    mois = parseInt(mois);
    loyer = parseInt(loyer);
    piece = parseInt(piece);
    autres = parseInt(autres);
    const CA_minus_commission = await Rendezvous.aggregate([
        {
            $match: {
                is_valid: 1,
                $expr: {
                    $eq: [
                        { $year: '$date_heure' },
                        { $year: new Date() }
                    ]
                },
                $expr: {
                    $eq: [
                        { $month: '$date_heure' },
                        mois
                    ]
                }
            }
        },
        {
            $lookup: {
                from: 'services',
                localField: 'id_service',
                foreignField: '_id',
                as: 'service'
            }
        },
        {
            $unwind: { path: "$service" }
        },
        {
            $group: {
                _id: { year: { $year: '$date_heure' }, month: { $month: '$date_heure' } },
                chiffre: { $sum: { $subtract: ["$service.prix", {$multiply: ["$service.prix", { $divide: ["$service.commission", 100] }] }]} }
            }
        }
    ])

    const rep = {
        "mois": CA_minus_commission[0]._id.month,
        "year": CA_minus_commission[0]._id.year,
        "CA": (CA_minus_commission[0].chiffre - loyer - piece - autres)
    }

    return rep;
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete_manager,
    login,
    getTempsMoyenTravailPourChaqueEmpoye,
    nbrReservation_jour,
    nbrReservation_mois,
    chiffreAffaire_jour,
    chiffreAffaire_mois,
    beneficeparmois
}