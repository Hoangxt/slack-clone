import {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { cn } from '@/lib/utils';

import { Hint } from './hint';
import { Button } from './ui/button';

import Image from 'next/image';
import { MdSend } from 'react-icons/md';
import { PiTextAa } from 'react-icons/pi';
import { ImageIcon, Smile, XIcon } from 'lucide-react';

import { Delta, Op } from 'quill/core';
import Quill, { type QuillOptions } from 'quill';
import 'quill/dist/quill.snow.css';

type EditorValue = {
  image: File | null;
  body: string;
};

interface EditorProps {
  onSubmit: ({ image, body }: EditorValue) => void;
  onCancel?: () => void;
  placeholder?: string;
  defaultValue?: Delta | Op[];
  disabled?: boolean;
  innerRef?: MutableRefObject<Quill | null>;
  variant?: 'create' | 'update';
}

const Editor = ({
  onCancel,
  onSubmit,
  placeholder = 'Write something...',
  defaultValue = [],
  disabled = false,
  innerRef,
  variant = 'create',
}: EditorProps) => {
  // trạng thái của text, ảnh nếu có sẽ diện icon sen còn không thì sẽ disabled nó đi
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  // trạng thái của thanh Toolbar
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  // useRef
  const submitRef = useRef(onSubmit);
  const placeholderRef = useRef(placeholder);
  const defaultValueRef = useRef(defaultValue);
  const disabledRef = useRef(disabled);

  const imageElementRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ko can add het vao dep cua useEffect
  useLayoutEffect(() => {
    submitRef.current = onSubmit;
    placeholderRef.current = placeholder;
    defaultValueRef.current = defaultValue;
    disabledRef.current = disabled;
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement('div')
    );

    const options: QuillOptions = {
      theme: 'snow',
      placeholder: placeholderRef.current,
      modules: {
        // chỉnh sủa các thành phần được hiển thị trên toolbar
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'clean'],
        ],
        // custom keyboard func
        keyboard: {
          bindings: {
            enter: {
              key: 'Enter',
              handler: () => {
                // submit form
                const text = quill.getText();
                const addedImage = imageElementRef.current?.files?.[0] || null;

                const isEmpty =
                  !addedImage &&
                  text.replace(/<(.|\n)*?>/g, '').trim().length === 0;

                if (isEmpty) return;

                const body = JSON.stringify(quill.getContents());
                submitRef.current?.({ body, image: addedImage });
              },
            },
            shift_enter: {
              // shift_enter để xuống dòng
              key: 'Enter',
              shiftKey: true,
              handler: () => {
                quill.insertText(quill.getSelection()?.index || 0, '\n');
              },
            },
          },
        },
      },
    };

    // sẽ focus vào quill [con trỏ nhấp nháy để chat]
    const quill = new Quill(editorContainer, options);
    quillRef.current = quill;
    quillRef.current.focus();

    if (innerRef) {
      innerRef.current = quill;
    }

    quill.setContents(defaultValueRef.current);
    setText(quill.getText());

    quill.on(Quill.events.TEXT_CHANGE, () => {
      setText(quill.getText());
    });

    return () => {
      quill.off(Quill.events.TEXT_CHANGE);
      if (container) {
        container.innerHTML = '';
      }
      if (quillRef.current) {
        quillRef.current = null;
      }
      if (innerRef) {
        innerRef.current = null;
      }
    };
  }, [innerRef]);

  // hàm hiểm thị hoặc ẩn thanh chat Toolbar
  const toggleToolbar = () => {
    setIsToolbarVisible((current) => !current);
    const toolbarElement = containerRef.current?.querySelector('.ql-toolbar');

    if (toolbarElement) {
      toolbarElement.classList.toggle('hidden');
    }
  };

  // kiểm tra state của text có đang trống không isEmpty=true -> ko có kí tụ nào trong đoạn chat
  // xóa các kí tự  vd <div></div>, <P></P>
  const isEmpty = !image && text.replace(/<(.|\n)*?>/g, '').trim().length === 0;

  // console.log({ isEmpty, text });

  return (
    <div className='flex flex-col'>
      <div className='flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white'>
        <div ref={containerRef} className='h-full ql-custom' />
        <div className='flex px-2 pb-2 z-[5]'>
          <Hint
            label={isToolbarVisible ? 'Hide formatting' : 'Show formatting'}
          >
            <Button
              disabled={disabled}
              onClick={toggleToolbar}
              size='iconSm'
              variant='ghost'
            >
              <PiTextAa className='size-4' />
            </Button>
          </Hint>
          <Hint label='Emoji'>
            <Button disabled={disabled} size='iconSm' variant='ghost'>
              <Smile className='size-4' />
            </Button>
          </Hint>
          {variant === 'create' && (
            <Hint label='Image'>
              <Button
                disabled={disabled}
                onClick={() => {}}
                size='iconSm'
                variant='ghost'
              >
                <ImageIcon className='size-4' />
              </Button>
            </Hint>
          )}

          {variant === 'update' && (
            <div className='ml-auto flex items-center gap-x-2'>
              <Button
                size='sm'
                variant='outline'
                disabled={false}
                onClick={() => {}}
              >
                Cancel
              </Button>
              <Button
                size='sm'
                className='bg-[#007A5A]  hover:bg-[#007A5A]/80 text-white'
                disabled={disabled || isEmpty}
                onClick={() => {}}
              >
                Save
              </Button>
            </div>
          )}

          {variant === 'create' && (
            <Button
              disabled={disabled || isEmpty}
              onClick={() => {}}
              size='iconSm'
              className={cn(
                'ml-auto',
                isEmpty
                  ? 'bg-white text-muted-foreground hover:bg-white'
                  : 'bg-[#007A5A] text-white hover:bg-[#007A5A]/80'
              )}
            >
              <MdSend className='size-4' />
            </Button>
          )}
        </div>
      </div>

      <div className='flex justify-end p-2 text-[10px] text-muted-foreground'>
        <p>
          <strong>Shift + Enter</strong> to add a new line
        </p>
      </div>
    </div>
  );
};

export default Editor;
