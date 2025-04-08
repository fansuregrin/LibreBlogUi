export const validatePassword = (rule, value, callback) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).{6,20}$/;

  if (!regex.test(value)) {
    callback(new Error("密码必须包含大写字母、小写字母、数字和特殊字符，长度为6~20，不能包含空格"));
  } else {
    callback();
  }
}

export const validateEmail = (rule, value, callback) => {
  const regex = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*@(\w+)(\.(\w+))+$/
  if (!regex.test(value)) {
    callback(new Error("无效的邮箱"))
  } else {
    callback();
  }
}

export const validateUsername = (rule, value, callback) => {
  console.debug(`type of ${value}: ${typeof value}`)
  if (value.length < 4) {
    callback(new Error('用户名长度不能少于4个字符'))
  }
  for (let c of value) {
    if (/\s/.test(c)) {
      callback(new Error('用户名不能包含空白字符'))
    }
  }
  callback()
}