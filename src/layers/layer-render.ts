  // load renders
  const renderBuilders = {};
  Object.keys(renders).forEach((key) => {
    renderBuilders[key] = renders[key].order;
  });
  container.provide('renders', renderBuilders);
