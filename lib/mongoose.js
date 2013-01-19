var util = require('util');
var moment = require('moment');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

exports.connect = function(dburl, callback) {
    mongoose.connect(dburl);
}

exports.disconnect = function(callback) {
    mongoose.disconnect(callback);
}

exports.setup = function(callback) { callback(null); }

var ArticleSchema = new Schema({
    ts     : { type: Date, default: Date.now },
    title  : String,
    article   : String,
    description : String,
    keywords : String,
    alias : String
});

mongoose.model('Article', ArticleSchema);
var Article = mongoose.model('Article');

exports.emptyArticle = { "_id": "", title: "", article: "", alias: "", description: "", keywords: "" };

exports.add = function(title, ts, article, description, keywords, alias, callback) {
    var newArticle = new Article();
    newArticle.title = title;
    if (ts !== '') {
        var date_fields = ts.split("/");
        newArticle.ts = new Date(date_fields[2], date_fields[0]-1, date_fields[1]);
    } else {
        newArticle.ts = new Date();
    }
    newArticle.article   = article;
    newArticle.description = description;
    newArticle.keywords = keywords;
    newArticle.alias = alias;
    newArticle.save(function(err) {
        if (err) {
            util.log('FATAL '+ err);
            callback(err);
        } else
            callback(null);
    });
}

exports.delete = function(id, callback) {
    exports.findArticleById(id, function(err, doc) {
        if (err) 
            callback(err);
        else {
            util.log(util.inspect(doc));
            doc.remove();
            callback(null);
        }
    });
}

exports.edit = function(id, title, ts, article, description, keywords, alias, callback) {
    exports.findArticleById(id, function(err, doc) {
        if (err)
            callback(err);
        else {
            if (ts !== undefined) {
                var date_fields = ts.split("/");
                doc.ts = new Date(date_fields[2], date_fields[0]-1, date_fields[1]);
            } else {
                doc.ts = new Date();
            }
            doc.title = title;
            doc.article   = article;
            doc.description = description;
            doc.keywords = keywords;
            doc.alias = alias;
            doc.save(function(err) {
                if (err) {
                    util.log('FATAL '+ err);
                    callback(err);
                } else
                    callback(null);
            });
        }
    });    
}

exports.allArticles = function(num, callback) {
    Article.find({}).limit(num).sort("-ts").execFind(callback);
}

exports.forAll = function(doEach, done) {
    Article.find({}, function(err, docs) {
        if (err) {
            util.log('FATAL '+ err);
            done(err, null);
        }
        docs.forEach(function(doc) {
            doEach(null, doc);
        });
        done(null);
    });
}

var findArticleById = exports.findArticleById = function(id, callback) {
    Article.findOne({ _id: id }, function(err, doc) {
        if (err) {
            util.log('FATAL '+ err);
            callback(err, null);
        }
        callback(null, doc);
    });
}
var findArticleByDate = exports.findArticleByDate = function(year, month, day, title, callback) {

    var start = new Date(year, month-1, day);   //months are 0 based so Jan equals 0
    var end = new Date(year, month-1, day);
    end.setMonth( end.getMonth( ) + 1 );
    util.log(start);
    util.log(end);
    util.log(title);
    Article.findOne({ts: {$gte: start, $lt: end}, alias: title}, function(err, doc) {
        if (err) {
            util.log('FATAL '+ err);
            callback(err, null);
        }
        util.log(doc);
        callback(null, doc);
    });
}
