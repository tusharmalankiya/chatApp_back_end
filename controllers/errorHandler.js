const errorHandler = (err) => {
  const errors = {};
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  if(err.message === "incorrect password"){
    errors.password = err.message;
  }

  if(err.message === "incorrect username"){
    errors.username = err.message;
  }

  return errors;
};

module.exports = errorHandler;
