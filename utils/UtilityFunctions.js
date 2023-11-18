function isEmailValid(email) {
  // Regular expression for a basic email validation
  const regexPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regexPattern.test(email);
}

function isStrongPassword(password) {
  // Define criteria for a strong password (e.g., at least 8 characters, a mix of uppercase and lowercase letters, numbers, and special characters)
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Test the password against the criteria
  return strongPasswordRegex.test(password);
}

export const checkValidation = (firstName, lastName, email, password) => {
  if (firstName.length < 3 || firstName == "" || firstName == " ") {
    throw new Error("Invalid Firstname");
  } else if (lastName.length < 3 || lastName == "" || lastName == " ") {
    throw new Error("Invalid Lastname");
  } else if (!isEmailValid(email)) {
    throw new Error("Invalid email. Please try again");
  } else if (password == "" || password == " ") {
    throw new Error("Password cannot be empty");
  } else if (isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }
};

export const inValidLogin = (errMessage) => {
  throw new Error(errMessage);
};
