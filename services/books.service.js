var DbMixin = require("../mixins/db.mixin");
var { MoleculerClientError } = require("moleculer").Errors;


module.exports = {
    // schema of books service
    name: "books",

    mixins: [
        DbMixin("books")
    ],
    methods: {
        // private methods of this service
        async seedDB() {
            this.adapter.insertMany([
                { bookId: "b101", bookName: "b1", author: "a1", price: 678 },
                { bookId: "b102", bookName: "b2", author: "a2", price: 1678 },
                { bookId: "b103", bookName: "b3", author: "a3", price: 6078 },
            ])
        }
    },
    actions: {
        addBooks: {
            rest: "POST /",
            params: {
                price: { type: "number", positive: true, integer: true },
                bookId: "string",
                bookName: "string",
                author: "string"
            },
            async handler(ctx) {
                // inserting a doc in the db
                var bookObj = {
                    bookId: ctx.params.bookId,
                    bookName: ctx.params.bookName,
                    price: ctx.params.price,
                    author: ctx.params.author
                }

                return "Book insertion successful " + JSON.stringify(bookObj);
            }
        },
        update: false,
        updateBook: {
            circuitBreaker: { enabled: true },
            auth: "required",
            rest: "PUT /:bId",
            params:
            {
                bId: "string",
                price: "number"
            },
            async handler(ctx) {
                var idOfBookToBeUpdated = ctx.params.bId;
                var newPrice = ctx.params.price;
                var findDoc = await this.adapter.findById(idOfBookToBeUpdated);
                if (findDoc) {
                    var setDoc = { $set: { price: newPrice } };
                    // db.books.updateOne({_id:idOfBookToBeUpdated},{$set:{price:newPrice}})
                    var res = this.adapter.updateById(idOfBookToBeUpdated, setDoc);
                    console.log("Result of update operation", res);
                    return res;
                }
                else {
                    throw new MoleculerClientError(`Book with the id : ${idOfBookToBeUpdated} not found,404`)
                }
            }
        }
    },
    settings: {
        fields: ["bookName", "author", "price", "bookId", "_id"],

        entityValidators:
        {
            price: { type: "number", positive: true, integer: true },
            bookId: "string",
            bookName: "string",
            author: "string"
        }
    }

}