const Customer = require('../../schemas/CustomerSchema.js')
const Offer = require('../../schemas/OfferSchema.js')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');
const Rendezvous = require('../../schemas/RendezvousSchema.js');
const Payment = require('../../schemas/PaymentSchema.js')

const login = async (email, mdp) => {
    const user = await Customer.findOne({email:email})
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
    return await Customer.find();
}

const getById = async (id) => {
    return await Customer.findOne({_id : id});
}

const create = async (image, nom, prenom, tel, email, addresse, mdp) =>  {
    // Generate a salt
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    // Hash the password using the generated salt
    const hashedmdp = await bcrypt.hash(mdp, salt);

    let customer = new Customer();
    customer.image = image
    customer.nom = nom
    customer.mdp = hashedmdp
    customer.prenom = prenom
    customer.tel = tel
    customer.email = email
    customer.addresse = addresse
    return await customer.save()
}

const update = async (id, image, nom, prenom, tel, email, addresse, mdp) => {
    let customer = await Customer.findById(id)
    if(image !== undefined) customer.image = image
    if(nom !== undefined) customer.nom = nom
    if(mdp !== undefined) {
        // Generate a salt
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);

        // Hash the password using the generated salt
        const hashedmdp = await bcrypt.hash(mdp, salt);
        customer.mdp = hashedmdp
    }
    if(prenom !== undefined) customer.prenom = prenom
    if(tel !== undefined) customer.tel = tel
    if(email !== undefined) customer.email = email
    if(addresse !== undefined) customer.addresse = addresse
    return await customer.save()
}

const delete_customer = async (id) => {
    return await Customer.deleteOne({ _id : id });
}

const payment = async (id_rendezvous) => {
    //Check if id_rendezvous is already paid
    const paid = await Payment.find({"id_rendezvous" : id_rendezvous})
    if(paid.length > 0) throw new Error("Rendez-vous already paid")

    const rdv = await Rendezvous.where("_id")
                                .equals(id_rendezvous)
                                .populate("id_service")

    // Check if id_service and id_customer have an offer based on the id_rendezvous date_heure
    const offer = await Offer.aggregate([
        {
            $match: {
                id_customer: rdv[0].id_customer,
                id_service: rdv[0].id_service._id,
                date_heure_fin: { $gte: rdv[0].date_heure }
            }
        }
    ])

    let pay = new Payment()
    pay.id_rendezvous = id_rendezvous
    pay.prix = rdv[0].id_service.prix - (rdv[0].id_service.prix * (offer[0].reduction / 100))
    pay.save()

    return pay
    // return offer
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete_customer,
    login,
    payment
}