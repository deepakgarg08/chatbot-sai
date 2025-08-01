import { describe, it, expect, beforeEach } from 'vitest'
import chatReducer, {
  setUsername,
  addMessage,
  setMessages,
  userTyping,
  userStopTyping,
  clearTyping,
  triggerAnimation,
  resetAnimation,
  setIconState,
  setOnlineUsers,
  setActivePrivateChat,
  addPrivateMessage,
  resetUnreadCount,
  clearAllData,
} from '../../store/chatSlice'

describe('chatSlice', () => {
  let initialState

  beforeEach(() => {
    initialState = {
      messages: [],
      username: "",
      typingUsers: [],
      animationTrigger: false,
      iconState: "static",
      onlineUsers: [],
      privateChats: {},
      activePrivateChat: null,
      unreadCounts: {},
    }
  })

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(chatReducer(undefined, { type: 'unknown' })).toEqual(initialState)
    })
  })

  describe('setUsername', () => {
    it('should set the username', () => {
      const action = setUsername('testUser')
      const result = chatReducer(initialState, action)

      expect(result.username).toBe('testUser')
    })

    it('should update existing username', () => {
      const state = { ...initialState, username: 'oldUser' }
      const action = setUsername('newUser')
      const result = chatReducer(state, action)

      expect(result.username).toBe('newUser')
    })
  })

  describe('messages management', () => {
    describe('addMessage', () => {
      it('should add a new message to empty messages array', () => {
        const message = { user: 'testUser', text: 'Hello', timestamp: Date.now() }
        const action = addMessage(message)
        const result = chatReducer(initialState, action)

        expect(result.messages).toHaveLength(1)
        expect(result.messages[0]).toEqual(message)
      })

      it('should add a message to existing messages', () => {
        const existingMessage = { user: 'user1', text: 'First', timestamp: Date.now() - 1000 }
        const state = { ...initialState, messages: [existingMessage] }
        const newMessage = { user: 'user2', text: 'Second', timestamp: Date.now() }

        const action = addMessage(newMessage)
        const result = chatReducer(state, action)

        expect(result.messages).toHaveLength(2)
        expect(result.messages[1]).toEqual(newMessage)
      })
    })

    describe('setMessages', () => {
      it('should replace all messages', () => {
        const existingMessages = [
          { user: 'user1', text: 'Old message', timestamp: Date.now() }
        ]
        const state = { ...initialState, messages: existingMessages }

        const newMessages = [
          { user: 'user2', text: 'New message 1', timestamp: Date.now() },
          { user: 'user3', text: 'New message 2', timestamp: Date.now() }
        ]

        const action = setMessages(newMessages)
        const result = chatReducer(state, action)

        expect(result.messages).toEqual(newMessages)
        expect(result.messages).toHaveLength(2)
      })

      it('should set empty messages array', () => {
        const state = {
          ...initialState,
          messages: [{ user: 'user1', text: 'message', timestamp: Date.now() }]
        }

        const action = setMessages([])
        const result = chatReducer(state, action)

        expect(result.messages).toEqual([])
      })
    })
  })

  describe('typing indicators', () => {
    describe('userTyping', () => {
      it('should add user to typing users list', () => {
        const action = userTyping('testUser')
        const result = chatReducer(initialState, action)

        expect(result.typingUsers).toContain('testUser')
        expect(result.typingUsers).toHaveLength(1)
      })

      it('should not add duplicate user to typing list', () => {
        const state = { ...initialState, typingUsers: ['testUser'] }
        const action = userTyping('testUser')
        const result = chatReducer(state, action)

        expect(result.typingUsers).toHaveLength(1)
        expect(result.typingUsers).toEqual(['testUser'])
      })

      it('should add multiple different users to typing list', () => {
        const state = { ...initialState, typingUsers: ['user1'] }
        const action = userTyping('user2')
        const result = chatReducer(state, action)

        expect(result.typingUsers).toHaveLength(2)
        expect(result.typingUsers).toContain('user1')
        expect(result.typingUsers).toContain('user2')
      })
    })

    describe('userStopTyping', () => {
      it('should remove user from typing users list', () => {
        const state = { ...initialState, typingUsers: ['user1', 'user2'] }
        const action = userStopTyping('user1')
        const result = chatReducer(state, action)

        expect(result.typingUsers).toEqual(['user2'])
        expect(result.typingUsers).toHaveLength(1)
      })

      it('should handle removing non-existent user', () => {
        const state = { ...initialState, typingUsers: ['user1'] }
        const action = userStopTyping('user2')
        const result = chatReducer(state, action)

        expect(result.typingUsers).toEqual(['user1'])
      })

      it('should handle empty typing users list', () => {
        const action = userStopTyping('user1')
        const result = chatReducer(initialState, action)

        expect(result.typingUsers).toEqual([])
      })
    })

    describe('clearTyping', () => {
      it('should clear all typing users', () => {
        const state = { ...initialState, typingUsers: ['user1', 'user2', 'user3'] }
        const action = clearTyping()
        const result = chatReducer(state, action)

        expect(result.typingUsers).toEqual([])
      })

      it('should handle already empty typing users', () => {
        const action = clearTyping()
        const result = chatReducer(initialState, action)

        expect(result.typingUsers).toEqual([])
      })
    })
  })

  describe('animation controls', () => {
    describe('triggerAnimation', () => {
      it('should set animationTrigger to true', () => {
        const action = triggerAnimation()
        const result = chatReducer(initialState, action)

        expect(result.animationTrigger).toBe(true)
      })
    })

    describe('resetAnimation', () => {
      it('should set animationTrigger to false', () => {
        const state = { ...initialState, animationTrigger: true }
        const action = resetAnimation()
        const result = chatReducer(state, action)

        expect(result.animationTrigger).toBe(false)
      })
    })

    describe('setIconState', () => {
      it('should set icon state to sent', () => {
        const action = setIconState('sent')
        const result = chatReducer(initialState, action)

        expect(result.iconState).toBe('sent')
      })

      it('should set icon state to received', () => {
        const action = setIconState('received')
        const result = chatReducer(initialState, action)

        expect(result.iconState).toBe('received')
      })

      it('should set icon state back to static', () => {
        const state = { ...initialState, iconState: 'sent' }
        const action = setIconState('static')
        const result = chatReducer(state, action)

        expect(result.iconState).toBe('static')
      })
    })
  })

  describe('online users management', () => {
    describe('setOnlineUsers', () => {
      it('should set online users list', () => {
        const users = ['user1', 'user2', 'user3']
        const action = setOnlineUsers(users)
        const result = chatReducer(initialState, action)

        expect(result.onlineUsers).toEqual(users)
      })

      it('should replace existing online users', () => {
        const state = { ...initialState, onlineUsers: ['oldUser'] }
        const newUsers = ['newUser1', 'newUser2']
        const action = setOnlineUsers(newUsers)
        const result = chatReducer(state, action)

        expect(result.onlineUsers).toEqual(newUsers)
      })

      it('should handle empty users list', () => {
        const state = { ...initialState, onlineUsers: ['user1', 'user2'] }
        const action = setOnlineUsers([])
        const result = chatReducer(state, action)

        expect(result.onlineUsers).toEqual([])
      })
    })
  })

  describe('private chat management', () => {
    describe('setActivePrivateChat', () => {
      it('should set active private chat', () => {
        const action = setActivePrivateChat('testUser')
        const result = chatReducer(initialState, action)

        expect(result.activePrivateChat).toBe('testUser')
      })

      it('should clear typing users when switching chats', () => {
        const state = {
          ...initialState,
          typingUsers: ['user1', 'user2'],
          activePrivateChat: 'oldUser'
        }
        const action = setActivePrivateChat('newUser')
        const result = chatReducer(state, action)

        expect(result.activePrivateChat).toBe('newUser')
        expect(result.typingUsers).toEqual([])
      })

      it('should reset unread count for the active chat', () => {
        const state = {
          ...initialState,
          unreadCounts: { 'testUser': 5, 'otherUser': 3 }
        }
        const action = setActivePrivateChat('testUser')
        const result = chatReducer(state, action)

        expect(result.unreadCounts.testUser).toBe(0)
        expect(result.unreadCounts.otherUser).toBe(3)
      })

      it('should handle setting null active chat', () => {
        const state = { ...initialState, activePrivateChat: 'testUser' }
        const action = setActivePrivateChat(null)
        const result = chatReducer(state, action)

        expect(result.activePrivateChat).toBe(null)
      })
    })

    describe('addPrivateMessage', () => {
      const currentUser = 'currentUser'
      const otherUser = 'otherUser'
      const timestamp = Date.now()

      beforeEach(() => {
        initialState.username = currentUser
      })

      it('should add message when receiving from another user', () => {
        const messageData = {
          from: otherUser,
          to: currentUser,
          text: 'Hello there',
          timestamp
        }

        const action = addPrivateMessage(messageData)
        const result = chatReducer(initialState, action)

        expect(result.privateChats[otherUser]).toBeDefined()
        expect(result.privateChats[otherUser]).toHaveLength(1)
        expect(result.privateChats[otherUser][0]).toEqual({
          user: otherUser,
          text: 'Hello there',
          timestamp
        })
      })

      it('should add message when sending to another user', () => {
        const messageData = {
          from: currentUser,
          to: otherUser,
          text: 'Hello back',
          timestamp
        }

        const action = addPrivateMessage(messageData)
        const result = chatReducer(initialState, action)

        expect(result.privateChats[otherUser]).toBeDefined()
        expect(result.privateChats[otherUser]).toHaveLength(1)
        expect(result.privateChats[otherUser][0]).toEqual({
          user: currentUser,
          text: 'Hello back',
          timestamp
        })
      })

      it('should append to existing private chat', () => {
        const existingMessage = {
          user: otherUser,
          text: 'First message',
          timestamp: timestamp - 1000
        }

        const state = {
          ...initialState,
          privateChats: {
            [otherUser]: [existingMessage]
          }
        }

        const messageData = {
          from: currentUser,
          to: otherUser,
          text: 'Second message',
          timestamp
        }

        const action = addPrivateMessage(messageData)
        const result = chatReducer(state, action)

        expect(result.privateChats[otherUser]).toHaveLength(2)
        expect(result.privateChats[otherUser][1]).toEqual({
          user: currentUser,
          text: 'Second message',
          timestamp
        })
      })

      it('should increment unread count when chat is not active', () => {
        const state = {
          ...initialState,
          activePrivateChat: 'someOtherUser',
          unreadCounts: {}
        }

        const messageData = {
          from: otherUser,
          to: currentUser,
          text: 'Unread message',
          timestamp
        }

        const action = addPrivateMessage(messageData)
        const result = chatReducer(state, action)

        expect(result.unreadCounts[otherUser]).toBe(1)
      })

      it('should not increment unread count when chat is active', () => {
        const state = {
          ...initialState,
          activePrivateChat: otherUser,
          unreadCounts: {}
        }

        const messageData = {
          from: otherUser,
          to: currentUser,
          text: 'Read message',
          timestamp
        }

        const action = addPrivateMessage(messageData)
        const result = chatReducer(state, action)

        expect(result.unreadCounts[otherUser]).toBeUndefined()
      })

      it('should handle missing threadKey gracefully', () => {
        const messageData = {
          from: null,
          to: null,
          text: 'Invalid message',
          timestamp
        }

        const action = addPrivateMessage(messageData)
        const result = chatReducer(initialState, action)

        expect(result.privateChats).toEqual({})
      })

      it('should increment existing unread count', () => {
        const state = {
          ...initialState,
          activePrivateChat: 'someOtherUser',
          unreadCounts: { [otherUser]: 2 }
        }

        const messageData = {
          from: otherUser,
          to: currentUser,
          text: 'Another unread message',
          timestamp
        }

        const action = addPrivateMessage(messageData)
        const result = chatReducer(state, action)

        expect(result.unreadCounts[otherUser]).toBe(3)
      })
    })

    describe('resetUnreadCount', () => {
      it('should reset unread count for specific user', () => {
        const state = {
          ...initialState,
          unreadCounts: {
            'user1': 5,
            'user2': 3,
            'user3': 1
          }
        }

        const action = resetUnreadCount('user2')
        const result = chatReducer(state, action)

        expect(result.unreadCounts.user1).toBe(5)
        expect(result.unreadCounts.user2).toBe(0)
        expect(result.unreadCounts.user3).toBe(1)
      })

      it('should handle resetting non-existent user count', () => {
        const state = {
          ...initialState,
          unreadCounts: { 'user1': 5 }
        }

        const action = resetUnreadCount('nonExistentUser')
        const result = chatReducer(state, action)

        expect(result.unreadCounts.nonExistentUser).toBe(0)
        expect(result.unreadCounts.user1).toBe(5)
      })
    })
  })

  describe('clearAllData', () => {
    it('should reset all state to initial values', () => {
      const state = {
        messages: [{ user: 'user1', text: 'message', timestamp: Date.now() }],
        username: "testUser",
        typingUsers: ['user1', 'user2'],
        animationTrigger: true,
        iconState: "sent",
        onlineUsers: ['user1', 'user2'],
        privateChats: {
          'user1': [{ user: 'user1', text: 'private message', timestamp: Date.now() }]
        },
        activePrivateChat: 'user1',
        unreadCounts: { 'user1': 3 },
      }

      const action = clearAllData()
      const result = chatReducer(state, action)

      expect(result).toEqual(initialState)
    })
  })

  describe('state immutability', () => {
    it('should not mutate the original state when adding a message', () => {
      const originalState = { ...initialState }
      const message = { user: 'testUser', text: 'Hello', timestamp: Date.now() }
      const action = addMessage(message)

      chatReducer(initialState, action)

      expect(initialState).toEqual(originalState)
    })

    it('should not mutate the original state when modifying typing users', () => {
      const state = { ...initialState, typingUsers: ['user1'] }
      const originalState = { ...state, typingUsers: [...state.typingUsers] }
      const action = userTyping('user2')

      chatReducer(state, action)

      expect(state).toEqual(originalState)
    })
  })

  describe('edge cases', () => {
    it('should handle adding message with undefined properties', () => {
      const message = { user: undefined, text: undefined, timestamp: undefined }
      const action = addMessage(message)
      const result = chatReducer(initialState, action)

      expect(result.messages).toHaveLength(1)
      expect(result.messages[0]).toEqual(message)
    })

    it('should handle setting username to empty string', () => {
      const state = { ...initialState, username: 'existingUser' }
      const action = setUsername('')
      const result = chatReducer(state, action)

      expect(result.username).toBe('')
    })

    it('should handle setting icon state to invalid value', () => {
      const action = setIconState('invalid')
      const result = chatReducer(initialState, action)

      expect(result.iconState).toBe('invalid')
    })
  })
})
