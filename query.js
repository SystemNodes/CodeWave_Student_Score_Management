const express = require ('express');
const api = express();
api.use(express.json());
const PORT = 1993;
const {v4: uuidv4} = require ('uuid');
const codeWave_dataBase = require ('mysql2');

const sql = codeWave_dataBase.createConnection({
    host: "localhost",
    database: "CodeWave",
    user: "root",
    password: "coffee99"
});

sql.connect((err)=>{
    if (err){
       console.log(`Unable to establish connection: ${err.Message}`);
    }else {
        console.log(`MySQL connection established`);
    }
});

// Add to Student_Data Table
api.post("/create", (req, res)=>{
    try{
        const query = `
        INSERT INTO CodeWave.student_data
        (student_id, full_name, stack, email)
        VALUE(?, ?, ?, ?)
        `;

        const student_id = uuidv4();
        const {full_name, stack, email} = req.body;

        sql.query(query, [student_id, full_name, stack, email], (err, result)=>{
            if (err){
                res.status(400).json({message: err.sqlMessage})
            }else {
                return res.status(200).json({
                    message: `New Student Data Added`,
                    studentID: student_id
                });
            }
        });
    }catch (err){
        res.status(500).json({
           message: `Internal server error`,
           error: err.Message 
        });
    }
});

// Retrieve all Student data
api.get("/retrieve", (req, res)=>{
    try{
        const query = `
        SELECT * FROM CodeWave.student_data
        `;

        sql.query(query, (err, result)=>{
            if (err){
                return res.status(400).json({message: err.sqlMessage});
            }else {
                return res.status(200).json({
                    message: `The Following are the Students Data in CodeWave Bootcamp`,
                    data: result
                });
            }
        });
    }catch (err) {
        res.status(500).json({
            message: `Internal server error`,
            error: err.Message
        });
    }
});

// Retrieve selected Student Data
api.get("/retrieve/:studentID", (req, res)=>{
    try{
        const {studentID} = req.params
        const query = `
        SELECT * FROM CodeWave.student_data
        WHERE student_id = ${studentID}
        `;

        sql.query(query, (err, result)=>{
            if (err){
                return res.status(400).json({message: err.sqlMessage});
            }else {
                return res.status(200).json({
                    message: `Kindly find your selected Student Data`,
                    data: result
                });
            }
        });
    }catch (err) {
        res.status(500).json({
            message: `Internal server error`,
            error: err.Message
        });
    }
});

// Update Student data
api.put("/update/:studentID", (req, res)=>{
    try{
        const query = `
        UPDATE CodeWave.student_data
        SET stack = ?
        WHERE student_id = ${req.params.studentID}
        `;

        sql.query(query, [req.body.stack], (err)=>{
            if (err){
                return res.status(400).json({message: err.sqlMessage})
            }
            
            res.status(200).json({message: "Update successful"})
        });
    }catch(err) {
        res.status(500).json({
          message: "Internal server error",
          error: err.sqlMessage
        });
    }
});

// Delete from Database
api.delete("/delete/:studentID", (req, res) => {
    try {
        const deleteScoreQuery = `
        DELETE FROM Codewave.student_score
        WHERE student_id = ${req.params.studentID}
        `;

        const deleteStudentQuery = `
        DELETE FROM Codewave.student_data
        WHERE student_id = ${req.params.studentID}
        `

        sql.query(deleteScoreQuery, (err) => {
            if (err) {
                return res.status(400).json({ message: err.sqlMessage });
            }

            sql.query(deleteStudentQuery, (err) => {
                if (err) {
                    return res.status(400).json({ message: err.sqlMessage });
                }
            })

            res.status(200).json({ message: "Deletion successful" });
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            error: err.sqlMessage,
        });
    }
});

// Add student score
api.post("/score/:studentID", (req, res)=>{
    try{
        const query = `
            INSERT INTO CodeWave.student_score
            (score_id, student_id, punctuality_score, assignment_score)
            VALUES (?, ?, ?, ?)
        `;

        const scoreID = uuidv4();
        const {punctuality_score, assignment_score} = req.body;
        const total_score = punctuality_score + assignment_score;
        const {studentID} = req.params;
    

        sql.query(query, [scoreID, studentID, punctuality_score, assignment_score, total_score], (err, result) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            } else {
                return res.status(200).json({
                    message: "Student score successfully created",
                    id: scoreID
                });
            }
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
});


/* JOIN QUERY */

// retrieve all student info and score
api.get("/allrecords", (req, res) => {
    try {
      const query = `
        SELECT 
            sd.full_name AS student_name,
            sd.stack AS Program,
            ss.punctuality_score,
            ss.assignment_score,
            ss.total_score
        FROM CodeWave.student_Data sd
        LEFT JOIN CodeWave.student_score ss
            ON sd.student_id = ss.student_id
      `;

      sql.query(query, (err, result) => {
        if (err) {
          return res.status(400).json({ message: err.sqlMessage });
        } else {
          res.status(200).json({
            message: "Kindly below, the students records",
            data: result
          });
        }
      });
    } catch (err) {
      res.status(500).json({
        message: "Internal server error",
        error: err.message,
      });
    }
  });

  // Retrieve a student data and score
  api.get("/record/:studentInfo", (req, res) => {
      try {
        const query = `
            SELECT 
            sd.full_name AS student_name,
            sd.stack AS program,
            ss.punctuality_score,
            ss.assignment_score,
            ss.total_score
        FROM codeWave.student_score ss
        LEFT JOIN codeWave.student_data sd
            ON sd.student_id = ss.student_id
        WHERE sd.student_id = ${req.params.studentInfo}
        `;
  
        sql.query(query, (err, result) => {
          if (err) {
            return res.status(400).json({ message: err.sqlMessage });
          } 
          if (!result.length) {
            return res.status(404).json({
              message: "No score found for this student",
              score: err
            });
          }
            res.status(200).json({
              message: "Kindly find below students records",
              data: result
            });
        });
      } catch (err) {
        res.status(500).json({
          message: "Internal server error",
          error: err.message,
        });
      }
    });

api.listen(PORT, ()=>{
    console.log(`My API is listening on port: http://${PORT}`);
});