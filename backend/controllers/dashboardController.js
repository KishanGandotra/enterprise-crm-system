const pool = require('../config/db');

exports.getAnalytics = async (req, res) => {

  try {

    const totalRevenue = await pool.query(
      `
      SELECT COALESCE(SUM(expected_revenue),0) AS total
      FROM opportunities
      `
    );

    const wonDeals = await pool.query(
      `
      SELECT COUNT(*) AS count
      FROM opportunities
      WHERE status = 'WON'
      `
    );

    const lostDeals = await pool.query(
      `
      SELECT COUNT(*) AS count
      FROM opportunities
      WHERE status = 'LOST'
      `
    );

    const pipelineRevenue = await pool.query(
      `
      SELECT COALESCE(SUM(expected_revenue),0) AS total
      FROM opportunities
      WHERE status IN ('OPEN','IN_PROGRESS')
      `
    );

    res.json({
      totalRevenue: totalRevenue.rows[0].total,
      wonDeals: wonDeals.rows[0].count,
      lostDeals: lostDeals.rows[0].count,
      pipelineRevenue: pipelineRevenue.rows[0].total
    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      error: 'Analytics Failed'
    });

  }

};