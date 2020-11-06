import React, { useEffect, useRef, useState } from 'react';
import Email from 'models/Email';
import styles from 'components/EmailInput.module.css';
import mockEmails from 'mock/emails.json';
import { validateEmail } from 'helpers/validations';

interface EmailInputProps {}

// FIXME: I need to handle duplication of a email in the list

const EmailInput: React.FunctionComponent<EmailInputProps> = () => {
  const [tagEmails, setTagEmails] = useState<Email[]>([]);
  const [emailList, setEmailList] = useState<Email[]>([]);
  const [isInputRendered, setIsInputRendered] = useState(false);
  const [isOver, setIsOver] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const hoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // This is the mock data
  const emailsMock: Email[] = mockEmails;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEmailInput(value);
  };

  const EmptyState = () => (
    <div className={styles.emptyState}>Enter recipients...</div>
  );

  const handleClick = () => {
    setIsInputRendered(true);
  };

  const handleOnBlur = () => {
    if (!isOver) {
      setIsInputRendered(false);
      setEmailInput('');
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (event.key === 'Enter' || event.key === 'Tab') {
      const isValid = validateEmail(emailInput);

      storeEmail({ text: emailInput, isValid });
      setIsInputRendered(false);
      setEmailInput('');
    }
  };

  const storeEmail = (email: Email) => {
    const oldEmails = [...tagEmails];
    const isDuplicated = oldEmails.includes(email);
    if (!isDuplicated) {
      oldEmails.push(email);
      setTagEmails([...oldEmails]);
    }
  };

  const handleTagClick = (
    tag: Email,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    const oldEmails = [...tagEmails];
    const index = oldEmails.findIndex(ele => ele.text === tag.text);
    oldEmails.splice(index, 1);
    setTagEmails([...oldEmails]);
  };

  const handleListElementClick = (
    selectedEmail: Email,
    event: React.MouseEvent<HTMLLIElement, MouseEvent>
  ) => {
    event.stopPropagation();
    storeEmail(selectedEmail);
    setIsInputRendered(false);
    setEmailInput('');
  };

  useEffect(() => {
    if (isInputRendered) {
      inputRef.current?.focus();
    }
  }, [isInputRendered]);

  // This useEffect is for manage the onBlur of Input
  useEffect(() => {
    const node = hoverRef.current;
    if (node) {
      node.addEventListener('mouseover', () => setIsOver(true));
      node.addEventListener('mouseout', () => setIsOver(false));

      return () => {
        node.removeEventListener('mouseover', () => setIsOver(true));
        node.removeEventListener('mouseout', () => setIsOver(false));
      };
    }
  }, [hoverRef.current]);

  useEffect(() => {
    if (isInputRendered) {
      // TODO: Improve this using REGEX, will be faster.
      const filterList = emailsMock.filter(ele =>
        ele.text.includes(emailInput)
      );
      const sortedList = filterList.sort(sortFunction);

      const renderList = [];
      for (let i = 0; i < 20 && i < sortedList.length; i++) {
        renderList.push(sortedList[i]);
      }

      setEmailList([...renderList]);
    }
  }, [emailInput, emailsMock, isInputRendered]);

  return (
    <div className={styles.container} onClick={handleClick}>
      <div className={styles.emailsContainer}>
        {tagEmails.length !== 0 || isInputRendered ? (
          tagEmails?.map(ele => (
            <div
              key={ele.text}
              className={`${styles.tag} ${
                ele.isValid === false ? styles.notValid : ''
              }`}
              onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                handleTagClick(ele, event)
              }
            >
              <span>{ele.text}</span>
              {/* TODO:_I would replace this with an SVGICON from Material-UI for example.*/}
              {/* FIXME: The X ICON should be replaced ONHOVER with an exclamation sign ICON */}
              <div className={styles.delete}>x</div>
            </div>
          ))
        ) : (
          <EmptyState />
        )}
      </div>
      {isInputRendered && (
        <div className={styles.inputContainer}>
          {/* FIXME: The styles of the input should be updated, width, height */}
          <input
            type='email'
            name='email'
            id='email'
            value={emailInput}
            ref={inputRef}
            onChange={handleInputChange}
            className={styles.emailInput}
            onBlur={handleOnBlur}
            onKeyDown={handleKeyDown}
          />
          <div className={styles.listContainer} ref={hoverRef}>
            <ul className={styles.emailList}>
              {emailList.map(ele => (
                <li
                  key={ele.text}
                  className={styles.emailListElement}
                  onClick={(
                    event: React.MouseEvent<HTMLLIElement, MouseEvent>
                  ) => handleListElementClick(ele, event)}
                >
                  {ele.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailInput;

// TODO: With more time I would move this function into another file
const sortFunction = (a: Email, b: Email): number => {
  const emailA = a.text.toUpperCase();
  const emailB = b.text.toUpperCase();
  if (emailA < emailB) {
    return -1;
  }
  if (emailA > emailB) {
    return 1;
  }

  return 0;
};
