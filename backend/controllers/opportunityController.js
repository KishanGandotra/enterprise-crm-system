const pool = require('../config/db');


const createActivityLog = async (
  opportunityId,
  action,
  userId
) => {

  await pool.query(
    `
    INSERT INTO activity_logs
    (
      opportunity_id,
      action,
      performed_by
    )
    VALUES
    ($1,$2,$3)
    `,
    [
      opportunityId,
      action,
      userId
    ]
  );

};


exports.createOpportunity = async (req, res) => {

  try {

    const {
      name,
      client_name,
      description,
      service_line,
      region,
      expected_revenue,
      start_date,
      end_date
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO opportunities
      (
        name,
        client_name,
        description,
        service_line,
        region,
        expected_revenue,
        start_date,
        end_date,
        created_by
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        name,
        client_name,
        description,
        service_line,
        region,
        expected_revenue,
        start_date,
        end_date,
        req.user.id
      ]
    );

       await createActivityLog(
  result.rows[0].id,
  `Opportunity created`,
  req.user.id
);

    res.status(201).json(result.rows[0]);

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      error: 'Create Opportunity Failed'
    });

  }

};

exports.getAllOpportunities = async (req, res) => {

    const page = Number(req.query.page) || 1;

    const limit = 5;

    const offset = (page - 1) * limit;

  try {

    let result;

    if (req.user.role === 'ADMIN') {

      result = await pool.query(
        `
        SELECT *
        FROM opportunities
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
        `,
         [limit, offset]
);

    }

    else {

      result = await pool.query(
  `
  SELECT *
  FROM opportunities
  WHERE assigned_to = $1
  ORDER BY created_at DESC
  LIMIT $2 OFFSET $3
  `,
  [
    req.user.id,
    limit,
    offset
  ]
);

    }

    res.json(result.rows);

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      error: 'Fetch Failed'
    });

  }

};

exports.updateOpportunityStatus = async (req, res) => {

  try {

    const { status } = req.body;

    const result = await pool.query(
      `
      UPDATE opportunities
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, req.params.id]
    );


    await createActivityLog(
  req.params.id,
  `Status changed to ${status}`,
  req.user.id
);

    res.json(result.rows[0]);
    

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      error: 'Status Update Failed'
    });

  }

};



exports.uploadFile = async (req, res) => {

  try {

    const result = await pool.query(
      `
      INSERT INTO opportunity_files
      (
        opportunity_id,
        file_name,
        file_path,
        uploaded_by
      )
      VALUES
      ($1,$2,$3,$4)
      RETURNING *
      `,
      [
        req.params.id,
        req.file.originalname,
        req.file.filename,
        req.user.id
      ]
    );

    res.status(201).json(result.rows[0]);

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      error: 'Upload Failed'
    });

  }

};



exports.getOpportunityFiles = async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT *
      FROM opportunity_files
      WHERE opportunity_id = $1
      ORDER BY created_at DESC
      `,
      [req.params.id]
    );

    res.json(result.rows);

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      error: 'Fetch Files Failed'
    });

  }

};




exports.assignOpportunity = async (req, res) => {

  try {

    const { assigned_to } = req.body;

    const result = await pool.query(
      `
      UPDATE opportunities
      SET assigned_to = $1
      WHERE id = $2
      RETURNING *
      `,
      [
        assigned_to,
        req.params.id
      ]
    );
     
     await createActivityLog(
  req.params.id,
  `Opportunity assigned`,
  req.user.id
);

    res.json(result.rows[0]);

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      error: 'Assignment Failed'
    });

  }

};


exports.addOpportunityNote = async (req, res) => {

  try {

    const { note } = req.body;

    const result = await pool.query(
      `
      INSERT INTO opportunity_notes
      (
        opportunity_id,
        note,
        created_by
      )
      VALUES
      ($1,$2,$3)
      RETURNING *
      `,
      [
        req.params.id,
        note,
        req.user.id
      ]
    );

       await createActivityLog(
  req.params.id,
  `Added a note`,
  req.user.id
);

    res.status(201).json(result.rows[0]);

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      error: 'Add Note Failed'
    });

  }

};

exports.getOpportunityNotes = async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
      opportunity_notes.*,
      users.name
      FROM opportunity_notes
      JOIN users
      ON users.id = opportunity_notes.created_by
      WHERE opportunity_id = $1
      ORDER BY created_at DESC
      `,
      [req.params.id]
    );

    res.json(result.rows);

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      error: 'Fetch Notes Failed'
    });

  }

};


exports.getActivityLogs = async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
      activity_logs.*,
      users.name
      FROM activity_logs
      JOIN users
      ON users.id = activity_logs.performed_by
      WHERE opportunity_id = $1
      ORDER BY created_at DESC
      `,
      [req.params.id]
    );

    res.json(result.rows);

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      error: 'Fetch Activity Logs Failed'
    });

  }

};


exports.deleteOpportunity = async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query(
      'DELETE FROM opportunities WHERE id = $1',
      [id]
    );

    res.json({
      message: 'Opportunity Deleted'
    });

  }

  catch (err) {

  console.log(err);

  res.status(500).json({
    error: err.message
  });

}

};



exports.updateOpportunity = async (req, res) => {

  try {

    const {
      name,
      client_name,
      expected_revenue
    } = req.body;

    const result = await pool.query(
      `
      UPDATE opportunities
      SET
      name = $1,
      client_name = $2,
      expected_revenue = $3
      WHERE id = $4
      RETURNING *
      `,
      [
        name,
        client_name,
        expected_revenue,
        req.params.id
      ]
    );

    await createActivityLog(
      req.params.id,
      'Opportunity updated',
      req.user.id
    );

    res.json(result.rows[0]);

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      error: 'Update Failed'
    });

  }

};