const Preference = require('../../schemas/PreferenceSchema.js')
const mongoose = require('mongoose')

const getAll = async () => {
    return await Preference.find();
}

const getById = async (id) => {
    return await Preference.findOne({_id : id});
}

const create = async (id_customer, id_prefere, designation) =>  {
    let preference = new Preference();
    preference.id_customer = id_customer
    preference.id_prefere = id_prefere
    preference.designation = designation
    return await preference.save()
}

const update = async (id, id_customer, id_prefere, designation) => {
    let preference = await Preference.findById(id)
    if(id_customer !== undefined) preference.id_customer = id_customer
    if(id_prefere !== undefined) preference.id_prefere = id_prefere
    if(designation !== undefined) preference.designation = designation
    return await preference.save()
}

const delete_preference = async (id) => {
    return await Preference.deleteOne({ _id : id });
}

const employe_prefere = async (id_customer) => {
    const _id_customer = new mongoose.Types.ObjectId(id_customer);
    return await Preference.aggregate([
        {
            $match: {
                id_customer: _id_customer,
                designation: "employe"
            }
        },
        {
            $lookup: {
                from: 'employes',
                localField: 'id_prefere',
                foreignField: '_id',
                as: 'employe'
            }
        },
        {
            $unwind: { path: "$employe" }
        },
        {
            $project: {
                _id: 0,
                employe: "$employe"
            }
        }
    ]);
}

const service_prefere = async (id_customer) => {
    const _id_customer = new mongoose.Types.ObjectId(id_customer);
    return await Preference.aggregate([
        {
            $match: {
                id_customer: _id_customer,
                designation: "service"
            }
        },
        {
            $lookup: {
                from: 'services',
                localField: 'id_prefere',
                foreignField: '_id',
                as: 'services'
            }
        },
        {
            $unwind: { path: "$services" }
        },
        {
            $project: {
                _id: 0,
                services: "$services"
            }
        }
    ]);
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete_preference,
    employe_prefere,
    service_prefere
}