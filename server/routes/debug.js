module.exports = router => {
  router.get('/debug/status', (req, res) => res.render('debug/status', { layout: false }));
};
