// package ch.zhaw.powerpuff.powerpuff.controller;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.data.mongodb.core.MongoTemplate;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RestController;

// import com.mongodb.BasicDBObjectBuilder;
// import com.mongodb.DBObject;

// @RestController
// public class MongoTestController {
//     @Autowired
//     private MongoTemplate mongoTemplate;

//     @GetMapping("/api/testmongodb")
//     public ResponseEntity<String> testMongoDb() {
//         try {
//             // create test document
//             Long time = System.currentTimeMillis();
//             DBObject objectToSave = BasicDBObjectBuilder.start().add("time", time).get();
//             // store test document
//             DBObject saved = mongoTemplate.save(objectToSave, "products");
//             // retrive test document
//             DBObject read = mongoTemplate.findById(saved.get("_id"),DBObject.class,"products");
//             // verify retrived document
//             if (read != null && read.get("time").toString().equals(time.toString())) {
//                 return new ResponseEntity<>("Connection ok", HttpStatus.OK);
//             }
//         } catch (Exception e) {}  
//         return new ResponseEntity<>("Connection failed", HttpStatus.INTERNAL_SERVER_ERROR);
//     }
    
// }
