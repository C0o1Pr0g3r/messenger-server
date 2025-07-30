const EMPTY = "";
type Empty = typeof EMPTY;

const SPACE = " ";
type Space = typeof SPACE;

const COMMA = ",";
type Comma = typeof COMMA;

const PERIOD = ".";
type Period = typeof PERIOD;

const COLON = ":";
type Colon = typeof COLON;

const UNDERSCORE = "_";
type Underscore = typeof UNDERSCORE;

const QUESTION_MARK = "?";
type QuestionMark = typeof QUESTION_MARK;

const COMMA_WITH_SPACE = `${COMMA}${SPACE}`;
type CommaWithSpace = typeof COMMA_WITH_SPACE;

const COLON_WITH_SPACE = `${COLON}${SPACE}`;
type ColonWithSpace = typeof COLON_WITH_SPACE;

const SLASH = "/";
type Slash = typeof SLASH;

export {
  COLON,
  COLON_WITH_SPACE,
  COMMA,
  COMMA_WITH_SPACE,
  EMPTY,
  PERIOD,
  QUESTION_MARK,
  SLASH,
  SPACE,
  UNDERSCORE,
};
export type {
  Colon,
  ColonWithSpace,
  Comma,
  CommaWithSpace,
  Empty,
  Period,
  QuestionMark,
  Slash,
  Space,
  Underscore,
};
