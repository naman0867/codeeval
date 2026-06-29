// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

const problems = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'EASY',
    timeLimit: 10000,
    description: `## Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return the **indices** of the two numbers that add up to \`target\`.

### Example 1
\`\`\`
Input:  nums = [2, 7, 11, 15], target = 9
Output: [0,1]
\`\`\`

### Example 2
\`\`\`
Input:  nums = [3, 2, 4], target = 6
Output: [1,2]
\`\`\`

### Constraints
- 2 <= nums.length <= 10^4
- Only one valid answer exists.`,
    testCases: [
      { input: '[2,7,11,15]\n9', expected: '[0,1]', order: 0 },
      { input: '[3,2,4]\n6', expected: '[1,2]', order: 1 },
      { input: '[3,3]\n6', expected: '[0,1]', order: 2 },
      { input: '[1,2,3,4,5]\n9', expected: '[3,4]', order: 3, isHidden: true },
    ],
    starterCode: {
      PYTHON: `def two_sum(nums, target):
    # Your solution here
    pass

import sys, json
lines = sys.stdin.read().strip().split('\\n')
nums = json.loads(lines[0])
target = int(lines[1])
print(json.dumps(two_sum(nums, target), separators=(',', ':')))`,
      JAVASCRIPT: `function twoSum(nums, target) {
  // Your solution here
}

const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const nums = JSON.parse(lines[0]);
const target = parseInt(lines[1]);
console.log(JSON.stringify(twoSum(nums, target)));`,
      JAVA: `import java.util.*;
public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        return new int[]{};
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] arr = sc.nextLine().replaceAll("[\\\\[\\\\]]","").split(",");
        int[] nums = Arrays.stream(arr).mapToInt(Integer::parseInt).toArray();
        int target = Integer.parseInt(sc.nextLine().trim());
        int[] res = new Solution().twoSum(nums, target);
        System.out.println("["+res[0]+","+res[1]+"]");
    }
}`,
      CPP: `#include <bits/stdc++.h>
using namespace std;
vector<int> twoSum(vector<int>& nums, int target) {
    // Your solution here
    return {};
}
int main() {
    string s; int target;
    getline(cin, s); cin >> target;
    vector<int> nums;
    stringstream ss(s.substr(1, s.size()-2));
    string tok;
    while(getline(ss, tok, ',')) nums.push_back(stoi(tok));
    auto res = twoSum(nums, target);
    cout << "[" << res[0] << "," << res[1] << "]" << endl;
}`,
    },
  },
  {
    title: 'Reverse String',
    slug: 'reverse-string',
    difficulty: 'EASY',
    timeLimit: 10000,
    description: `## Reverse String

Write a function that reverses a string. The input string is given as an array of characters.

### Example 1
\`\`\`
Input:  s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]
\`\`\`

### Constraints
- 1 <= s.length <= 10^5
- s[i] is a printable ASCII character.`,
    testCases: [
      { input: '["h","e","l","l","o"]', expected: '["o","l","l","e","h"]', order: 0 },
      { input: '["H","a","n","n","a","h"]', expected: '["h","a","n","n","a","H"]', order: 1 },
      { input: '["a"]', expected: '["a"]', order: 2, isHidden: true },
    ],
    starterCode: {
      PYTHON: `def reverseString(s):
    # Modify s in-place and return it
    pass

import sys, json
lines = sys.stdin.read().strip().split('\\n')
s = json.loads(lines[0])
reverseString(s)
print(json.dumps(s, separators=(',', ':')))`,
      JAVASCRIPT: `function reverseString(s) {
  // Modify s in-place
}
const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const s = JSON.parse(lines[0]);
reverseString(s);
console.log(JSON.stringify(s));`,
      JAVA: `import java.util.*;
public class Solution {
    public void reverseString(char[] s) {
        // Your solution
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().replaceAll("[\\\\[\\\\]\"\\\\s]","");
        char[] s = line.split(",")[0].isEmpty() ? new char[0] : line.chars().filter(c->c!=',').mapToObj(c->(char)c).collect(java.util.stream.Collectors.joining()).toCharArray();
        new Solution().reverseString(s);
        System.out.println(Arrays.toString(s).replace(", ","\",\"").replace("[","[\"").replace("]","\"]"));
    }
}`,
      CPP: `#include <bits/stdc++.h>
using namespace std;
void reverseString(vector<char>& s) {
    // Your solution
}
int main() {
    string line; getline(cin, line);
    vector<char> s;
    for(char c: line) if(c!='"'&&c!='['&&c!=']'&&c!=',') s.push_back(c);
    reverseString(s);
    cout << "[";
    for(int i=0;i<s.size();i++) { if(i) cout<<","; cout<<"\""<<s[i]<<"\""; }
    cout << "]" << endl;
}`,
    },
  },
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'EASY',
    timeLimit: 10000,
    description: `## Valid Parentheses

Given a string \`s\` containing just \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid.

A string is valid if:
- Open brackets must be closed by the same type of brackets.
- Open brackets must be closed in the correct order.

### Example 1
\`\`\`
Input:  s = "()"
Output: true
\`\`\`

### Example 2
\`\`\`
Input:  s = "()[]{}"
Output: true
\`\`\`

### Example 3
\`\`\`
Input:  s = "(]"
Output: false
\`\`\``,
    testCases: [
      { input: '()', expected: 'true', order: 0 },
      { input: '()[]{}', expected: 'true', order: 1 },
      { input: '(]', expected: 'false', order: 2 },
      { input: '([)]', expected: 'false', order: 3 },
      { input: '{[]}', expected: 'true', order: 4, isHidden: true },
    ],
    starterCode: {
      PYTHON: `def isValid(s):
    # Your solution here
    pass

import sys
s = sys.stdin.read().strip()
print(str(isValid(s)).lower())`,
      JAVASCRIPT: `function isValid(s) {
  // Your solution here
}
const s = require('fs').readFileSync('/dev/stdin','utf8').trim();
console.log(isValid(s).toString());`,
      JAVA: `import java.util.*;
public class Solution {
    public boolean isValid(String s) {
        // Your solution
        return false;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println(new Solution().isValid(sc.nextLine().trim()));
    }
}`,
      CPP: `#include <bits/stdc++.h>
using namespace std;
bool isValid(string s) {
    // Your solution
    return false;
}
int main() {
    string s; getline(cin, s);
    cout << (isValid(s) ? "true" : "false") << endl;
}`,
    },
  },
  {
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    difficulty: 'MEDIUM',
    timeLimit: 10000,
    description: `## Maximum Subarray

Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

### Example 1
\`\`\`
Input:  nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.
\`\`\`

### Example 2
\`\`\`
Input:  nums = [1]
Output: 1
\`\`\`

### Constraints
- 1 <= nums.length <= 10^5
- -10^4 <= nums[i] <= 10^4`,
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expected: '6', order: 0 },
      { input: '[1]', expected: '1', order: 1 },
      { input: '[5,4,-1,7,8]', expected: '23', order: 2 },
      { input: '[-1,-2,-3,-4]', expected: '-1', order: 3, isHidden: true },
    ],
    starterCode: {
      PYTHON: `def maxSubArray(nums):
    # Your solution here (Kadane's algorithm)
    pass

import sys, json
nums = json.loads(sys.stdin.read().strip())
print(maxSubArray(nums))`,
      JAVASCRIPT: `function maxSubArray(nums) {
  // Your solution here
}
const nums = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8').trim());
console.log(maxSubArray(nums));`,
      JAVA: `import java.util.*;
public class Solution {
    public int maxSubArray(int[] nums) {
        return 0;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] nums = Arrays.stream(sc.nextLine().replaceAll("[\\\\[\\\\]]","").split(",")).mapToInt(Integer::parseInt).toArray();
        System.out.println(new Solution().maxSubArray(nums));
    }
}`,
      CPP: `#include <bits/stdc++.h>
using namespace std;
int maxSubArray(vector<int>& nums) {
    return 0;
}
int main() {
    string s; getline(cin, s);
    vector<int> nums;
    stringstream ss(s.substr(1,s.size()-2));
    string tok;
    while(getline(ss,tok,',')) nums.push_back(stoi(tok));
    cout << maxSubArray(nums) << endl;
}`,
    },
  },
  {
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    difficulty: 'EASY',
    timeLimit: 10000,
    description: `## Climbing Stairs

You are climbing a staircase. It takes \`n\` steps to reach the top. Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?

### Example 1
\`\`\`
Input:  n = 2
Output: 2
Explanation: 1+1, 2
\`\`\`

### Example 2
\`\`\`
Input:  n = 3
Output: 3
Explanation: 1+1+1, 1+2, 2+1
\`\`\`

### Constraints
- 1 <= n <= 45`,
    testCases: [
      { input: '2', expected: '2', order: 0 },
      { input: '3', expected: '3', order: 1 },
      { input: '5', expected: '8', order: 2 },
      { input: '10', expected: '89', order: 3, isHidden: true },
      { input: '45', expected: '1836311903', order: 4, isHidden: true },
    ],
    starterCode: {
      PYTHON: `def climbStairs(n):
    # Your solution here (DP / Fibonacci)
    pass

import sys
n = int(sys.stdin.read().strip())
print(climbStairs(n))`,
      JAVASCRIPT: `function climbStairs(n) {
  // Your solution here
}
const n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());
console.log(climbStairs(n));`,
      JAVA: `import java.util.*;
public class Solution {
    public int climbStairs(int n) { return 0; }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println(new Solution().climbStairs(Integer.parseInt(sc.nextLine().trim())));
    }
}`,
      CPP: `#include <bits/stdc++.h>
using namespace std;
int climbStairs(int n) { return 0; }
int main() { int n; cin >> n; cout << climbStairs(n) << endl; }`,
    },
  },
  {
    title: 'Merge Sorted Array',
    slug: 'merge-sorted-array',
    difficulty: 'EASY',
    timeLimit: 10000,
    description: `## Merge Sorted Array

You are given two integer arrays \`nums1\` and \`nums2\`, sorted in non-decreasing order, and two integers \`m\` and \`n\`, representing the number of elements in \`nums1\` and \`nums2\` respectively.

Merge \`nums2\` into \`nums1\` as one sorted array.

### Example
\`\`\`
Input:  nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3
Output: [1,2,2,3,5,6]
\`\`\``,
    testCases: [
      { input: '[1,2,3,0,0,0]\n3\n[2,5,6]\n3', expected: '[1,2,2,3,5,6]', order: 0 },
      { input: '[1]\n1\n[]\n0', expected: '[1]', order: 1 },
      { input: '[0]\n0\n[1]\n1', expected: '[1]', order: 2, isHidden: true },
    ],
    starterCode: {
      PYTHON: `def merge(nums1, m, nums2, n):
    # Merge nums2 into nums1 in-place
    pass

import sys, json
lines = sys.stdin.read().strip().split('\\n')
nums1 = json.loads(lines[0]); m = int(lines[1])
nums2 = json.loads(lines[2]); n = int(lines[3])
merge(nums1, m, nums2, n)
print(json.dumps(nums1, separators=(',',':')))`,
      JAVASCRIPT: `function merge(nums1, m, nums2, n) {}
const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const nums1=JSON.parse(lines[0]),m=+lines[1],nums2=JSON.parse(lines[2]),n=+lines[3];
merge(nums1,m,nums2,n); console.log(JSON.stringify(nums1));`,
      JAVA: `import java.util.*;
public class Solution {
    public void merge(int[] nums1, int m, int[] nums2, int n) {}
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] nums1 = Arrays.stream(sc.nextLine().replaceAll("[\\\\[\\\\]]","").split(",")).mapToInt(Integer::parseInt).toArray();
        int m = Integer.parseInt(sc.nextLine().trim());
        int[] nums2 = Arrays.stream(sc.nextLine().replaceAll("[\\\\[\\\\]]","").split(",")).mapToInt(Integer::parseInt).toArray();
        int n = Integer.parseInt(sc.nextLine().trim());
        new Solution().merge(nums1,m,nums2,n);
        System.out.println(Arrays.toString(nums1).replace(", ",",").replace(" ",""));
    }
}`,
      CPP: `#include <bits/stdc++.h>
using namespace std;
void merge(vector<int>& n1, int m, vector<int>& n2, int n) {}
int main() {
    // parse and call merge
    cout << "[]" << endl;
}`,
    },
  },
  {
    title: 'Binary Search',
    slug: 'binary-search',
    difficulty: 'EASY',
    timeLimit: 10000,
    description: `## Binary Search

Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search target in nums. If target exists, return its index. Otherwise, return \`-1\`.

You must write an algorithm with **O(log n)** runtime complexity.

### Example 1
\`\`\`
Input:  nums = [-1,0,3,5,9,12], target = 9
Output: 4
\`\`\`

### Example 2
\`\`\`
Input:  nums = [-1,0,3,5,9,12], target = 2
Output: -1
\`\`\``,
    testCases: [
      { input: '[-1,0,3,5,9,12]\n9', expected: '4', order: 0 },
      { input: '[-1,0,3,5,9,12]\n2', expected: '-1', order: 1 },
      { input: '[5]\n5', expected: '0', order: 2, isHidden: true },
      { input: '[1,3,5,7,9,11]\n7', expected: '3', order: 3, isHidden: true },
    ],
    starterCode: {
      PYTHON: `def search(nums, target):
    # Implement binary search - O(log n)
    pass

import sys, json
lines = sys.stdin.read().strip().split('\\n')
nums = json.loads(lines[0]); target = int(lines[1])
print(search(nums, target))`,
      JAVASCRIPT: `function search(nums, target) {
  // O(log n) binary search
}
const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
console.log(search(JSON.parse(lines[0]), parseInt(lines[1])));`,
      JAVA: `import java.util.*;
public class Solution {
    public int search(int[] nums, int target) { return -1; }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] nums = Arrays.stream(sc.nextLine().replaceAll("[\\\\[\\\\]]","").split(",")).mapToInt(Integer::parseInt).toArray();
        System.out.println(new Solution().search(nums, Integer.parseInt(sc.nextLine().trim())));
    }
}`,
      CPP: `#include <bits/stdc++.h>
using namespace std;
int search(vector<int>& nums, int target) { return -1; }
int main() {
    string s; int t; getline(cin,s); cin>>t;
    vector<int> nums;
    stringstream ss(s.substr(1,s.size()-2));
    string tok; while(getline(ss,tok,',')) nums.push_back(stoi(tok));
    cout << search(nums,t) << endl;
}`,
    },
  },
  {
    title: 'Linked List Cycle',
    slug: 'linked-list-cycle',
    difficulty: 'EASY',
    timeLimit: 10000,
    description: `## Linked List Cycle Detection

Given the head of a linked list, determine if the linked list has a cycle in it.

For this problem, describe your approach in text. Given the input as an array and a \`pos\` (the index where the tail connects, -1 if no cycle), output \`true\` or \`false\`.

### Example 1
\`\`\`
Input:  nums = [3,2,0,-4], pos = 1
Output: true
\`\`\`

### Example 2
\`\`\`
Input:  nums = [1,2], pos = 0  
Output: true
\`\`\`

### Example 3
\`\`\`
Input:  nums = [1], pos = -1
Output: false
\`\`\`

**Hint:** Use Floyd's tortoise and hare algorithm.`,
    testCases: [
      { input: '[3,2,0,-4]\n1', expected: 'true', order: 0 },
      { input: '[1,2]\n0', expected: 'true', order: 1 },
      { input: '[1]\n-1', expected: 'false', order: 2 },
      { input: '[1,2,3,4,5]\n-1', expected: 'false', order: 3, isHidden: true },
    ],
    starterCode: {
      PYTHON: `def hasCycle(nums, pos):
    # pos = -1 means no cycle
    # Return True if cycle exists
    pass

import sys, json
lines = sys.stdin.read().strip().split('\\n')
nums = json.loads(lines[0]); pos = int(lines[1])
print(str(hasCycle(nums, pos)).lower())`,
      JAVASCRIPT: `function hasCycle(nums, pos) {
  // pos = -1 means no cycle
}
const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
console.log(hasCycle(JSON.parse(lines[0]), parseInt(lines[1])).toString());`,
      JAVA: `import java.util.*;
public class Solution {
    public boolean hasCycle(int[] nums, int pos) { return pos != -1; }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] nums = Arrays.stream(sc.nextLine().replaceAll("[\\\\[\\\\]]","").split(",")).mapToInt(Integer::parseInt).toArray();
        System.out.println(new Solution().hasCycle(nums, Integer.parseInt(sc.nextLine().trim())));
    }
}`,
      CPP: `#include <bits/stdc++.h>
using namespace std;
bool hasCycle(vector<int>& nums, int pos) { return pos != -1; }
int main() {
    string s; int pos; getline(cin,s); cin>>pos;
    vector<int> nums;
    stringstream ss(s.substr(1,s.size()-2));
    string tok; while(getline(ss,tok,',')) nums.push_back(stoi(tok));
    cout << (hasCycle(nums,pos)?"true":"false") << endl;
}`,
    },
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-sell-stock',
    difficulty: 'EASY',
    timeLimit: 10000,
    description: `## Best Time to Buy and Sell Stock

You are given an array \`prices\` where \`prices[i]\` is the price of a stock on the \`i-th\` day.

You want to maximize your profit by choosing a single day to buy and a single day in the future to sell. Return the maximum profit. If no profit is possible, return \`0\`.

### Example 1
\`\`\`
Input:  prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price=1), sell on day 5 (price=6). Profit = 6-1 = 5.
\`\`\`

### Example 2
\`\`\`
Input:  prices = [7,6,4,3,1]
Output: 0
Explanation: No profitable transaction possible.
\`\`\``,
    testCases: [
      { input: '[7,1,5,3,6,4]', expected: '5', order: 0 },
      { input: '[7,6,4,3,1]', expected: '0', order: 1 },
      { input: '[2,4,1]', expected: '2', order: 2, isHidden: true },
      { input: '[1,2,3,4,5]', expected: '4', order: 3, isHidden: true },
    ],
    starterCode: {
      PYTHON: `def maxProfit(prices):
    # Your solution here
    pass

import sys, json
prices = json.loads(sys.stdin.read().strip())
print(maxProfit(prices))`,
      JAVASCRIPT: `function maxProfit(prices) {}
console.log(maxProfit(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8').trim())));`,
      JAVA: `import java.util.*;
public class Solution {
    public int maxProfit(int[] prices) { return 0; }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] prices = Arrays.stream(sc.nextLine().replaceAll("[\\\\[\\\\]]","").split(",")).mapToInt(Integer::parseInt).toArray();
        System.out.println(new Solution().maxProfit(prices));
    }
}`,
      CPP: `#include <bits/stdc++.h>
using namespace std;
int maxProfit(vector<int>& p) { return 0; }
int main() {
    string s; getline(cin,s);
    vector<int> p;
    stringstream ss(s.substr(1,s.size()-2));
    string tok; while(getline(ss,tok,',')) p.push_back(stoi(tok));
    cout << maxProfit(p) << endl;
}`,
    },
  },
  {
    title: 'Longest Common Prefix',
    slug: 'longest-common-prefix',
    difficulty: 'EASY',
    timeLimit: 10000,
    description: `## Longest Common Prefix

Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string \`""\`.

### Example 1
\`\`\`
Input:  strs = ["flower","flow","flight"]
Output: "fl"
\`\`\`

### Example 2
\`\`\`
Input:  strs = ["dog","racecar","car"]
Output: ""
\`\`\``,
    testCases: [
      { input: '["flower","flow","flight"]', expected: 'fl', order: 0 },
      { input: '["dog","racecar","car"]', expected: '', order: 1 },
      { input: '["interview","inter","internal"]', expected: 'inter', order: 2, isHidden: true },
    ],
    starterCode: {
      PYTHON: `def longestCommonPrefix(strs):
    pass

import sys, json
strs = json.loads(sys.stdin.read().strip())
print(longestCommonPrefix(strs))`,
      JAVASCRIPT: `function longestCommonPrefix(strs) {}
console.log(longestCommonPrefix(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8').trim())));`,
      JAVA: `import java.util.*;
public class Solution {
    public String longestCommonPrefix(String[] strs) { return ""; }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] strs = sc.nextLine().replaceAll("[\\\\[\\\\]\"]","").split(",");
        System.out.println(new Solution().longestCommonPrefix(strs));
    }
}`,
      CPP: `#include <bits/stdc++.h>
using namespace std;
string longestCommonPrefix(vector<string>& s) { return ""; }
int main() {
    // parse and solve
    cout << "" << endl;
}`,
    },
  },
  {
    title: 'Number of Islands',
    slug: 'number-of-islands',
    difficulty: 'MEDIUM',
    timeLimit: 10000,
    description: `## Number of Islands

Given an \`m x n\` 2D binary grid where \`'1'\` represents land and \`'0'\` represents water, return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.

### Example 1
\`\`\`
Input:
11110
11010
11000
00000
Output: 1
\`\`\`

### Example 2
\`\`\`
Input:
11000
11000
00100
00011
Output: 3
\`\`\``,
    testCases: [
      { input: '["11110","11010","11000","00000"]', expected: '1', order: 0 },
      { input: '["11000","11000","00100","00011"]', expected: '3', order: 1 },
      { input: '["1"]', expected: '1', order: 2, isHidden: true },
    ],
    starterCode: {
      PYTHON: `def numIslands(grid):
    # Use DFS/BFS
    pass

import sys, json
grid = json.loads(sys.stdin.read().strip())
print(numIslands(grid))`,
      JAVASCRIPT: `function numIslands(grid) {}
console.log(numIslands(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8').trim())));`,
      JAVA: `import java.util.*;
public class Solution {
    public int numIslands(char[][] grid) { return 0; }
    public static void main(String[] args) {
        // parse input
        System.out.println(0);
    }
}`,
      CPP: `#include <bits/stdc++.h>
using namespace std;
int numIslands(vector<string>& grid) { return 0; }
int main() {
    string line; vector<string> grid;
    getline(cin, line);
    auto rows = line.substr(1,line.size()-2);
    // parse and solve
    cout << 0 << endl;
}`,
    },
  },
  {
    title: 'Product of Array Except Self',
    slug: 'product-except-self',
    difficulty: 'MEDIUM',
    timeLimit: 10000,
    description: `## Product of Array Except Self

Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`.

You must solve it without using division and in **O(n)** time.

### Example 1
\`\`\`
Input:  nums = [1,2,3,4]
Output: [24,12,8,6]
\`\`\`

### Example 2
\`\`\`
Input:  nums = [-1,1,0,-3,3]
Output: [0,0,9,0,0]
\`\`\``,
    testCases: [
      { input: '[1,2,3,4]', expected: '[24,12,8,6]', order: 0 },
      { input: '[-1,1,0,-3,3]', expected: '[0,0,9,0,0]', order: 1 },
      { input: '[2,3]', expected: '[3,2]', order: 2, isHidden: true },
    ],
    starterCode: {
      PYTHON: `def productExceptSelf(nums):
    # O(n) without division
    pass

import sys, json
nums = json.loads(sys.stdin.read().strip())
print(json.dumps(productExceptSelf(nums), separators=(',',':')))`,
      JAVASCRIPT: `function productExceptSelf(nums) {}
const nums = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8').trim());
console.log(JSON.stringify(productExceptSelf(nums)));`,
      JAVA: `import java.util.*;
public class Solution {
    public int[] productExceptSelf(int[] nums) { return new int[]{}; }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] nums = Arrays.stream(sc.nextLine().replaceAll("[\\\\[\\\\]]","").split(",")).mapToInt(Integer::parseInt).toArray();
        System.out.println(Arrays.toString(new Solution().productExceptSelf(nums)).replaceAll("[\\\\[\\\\] ]","").replace(",",","));
    }
}`,
      CPP: `#include <bits/stdc++.h>
using namespace std;
vector<int> productExceptSelf(vector<int>& nums) { return {}; }
int main() {
    string s; getline(cin,s);
    vector<int> nums;
    stringstream ss(s.substr(1,s.size()-2));
    string tok; while(getline(ss,tok,',')) nums.push_back(stoi(tok));
    auto res = productExceptSelf(nums);
    cout<<"["; for(int i=0;i<res.size();i++){if(i)cout<<",";cout<<res[i];} cout<<"]"<<endl;
}`,
    },
  },
  {
    title: 'Coin Change',
    slug: 'coin-change',
    difficulty: 'MEDIUM',
    timeLimit: 10000,
    description: `## Coin Change

You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\`. Return the fewest number of coins needed to make up that amount. If it cannot be made, return \`-1\`.

### Example 1
\`\`\`
Input:  coins = [1,5,10,25], amount = 36
Output: 3  (25 + 10 + 1)
\`\`\`

### Example 2
\`\`\`
Input:  coins = [2], amount = 3
Output: -1
\`\`\`

### Constraints
- 1 <= coins.length <= 12
- 0 <= amount <= 10^4`,
    testCases: [
      { input: '[1,5,10,25]\n36', expected: '3', order: 0 },
      { input: '[2]\n3', expected: '-1', order: 1 },
      { input: '[1]\n0', expected: '0', order: 2, isHidden: true },
      { input: '[1,2,5]\n11', expected: '3', order: 3, isHidden: true },
    ],
    starterCode: {
      PYTHON: `def coinChange(coins, amount):
    # Dynamic programming
    pass

import sys, json
lines = sys.stdin.read().strip().split('\\n')
coins = json.loads(lines[0]); amount = int(lines[1])
print(coinChange(coins, amount))`,
      JAVASCRIPT: `function coinChange(coins, amount) {}
const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
console.log(coinChange(JSON.parse(lines[0]), parseInt(lines[1])));`,
      JAVA: `import java.util.*;
public class Solution {
    public int coinChange(int[] coins, int amount) { return -1; }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] coins = Arrays.stream(sc.nextLine().replaceAll("[\\\\[\\\\]]","").split(",")).mapToInt(Integer::parseInt).toArray();
        System.out.println(new Solution().coinChange(coins, Integer.parseInt(sc.nextLine().trim())));
    }
}`,
      CPP: `#include <bits/stdc++.h>
using namespace std;
int coinChange(vector<int>& coins, int amount) { return -1; }
int main() {
    string s; int amount; getline(cin,s); cin>>amount;
    vector<int> coins;
    stringstream ss(s.substr(1,s.size()-2));
    string tok; while(getline(ss,tok,',')) coins.push_back(stoi(tok));
    cout << coinChange(coins,amount) << endl;
}`,
    },
  },
  {
    title: 'Word Search',
    slug: 'word-search',
    difficulty: 'MEDIUM',
    timeLimit: 15000,
    description: `## Word Search

Given an \`m x n\` grid of characters \`board\` and a string \`word\`, return \`true\` if the word exists in the grid.

The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.

### Example 1
\`\`\`
Input:  board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"
Output: true
\`\`\`

### Example 2
\`\`\`
Input:  board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"
Output: true
\`\`\``,
    testCases: [
      { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\nABCCED', expected: 'true', order: 0 },
      { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\nSEE', expected: 'true', order: 1 },
      { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\nABCB', expected: 'false', order: 2, isHidden: true },
    ],
    starterCode: {
      PYTHON: `def exist(board, word):
    # DFS with backtracking
    pass

import sys, json
lines = sys.stdin.read().strip().split('\\n')
board = json.loads(lines[0]); word = lines[1]
print(str(exist(board, word)).lower())`,
      JAVASCRIPT: `function exist(board, word) {}
const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
console.log(exist(JSON.parse(lines[0]), lines[1]).toString());`,
      JAVA: `import java.util.*;
public class Solution {
    public boolean exist(char[][] board, String word) { return false; }
    public static void main(String[] args) { System.out.println(false); }
}`,
      CPP: `#include <bits/stdc++.h>
using namespace std;
bool exist(vector<vector<char>>& board, string word) { return false; }
int main() { cout << "false" << endl; }`,
    },
  },
  {
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    difficulty: 'HARD',
    timeLimit: 10000,
    description: `## Trapping Rain Water

Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.

### Example 1
\`\`\`
Input:  height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
\`\`\`

### Example 2
\`\`\`
Input:  height = [4,2,0,3,2,5]
Output: 9
\`\`\`

**Hint:** Use two-pointer approach for O(n) time and O(1) space.`,
    testCases: [
      { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expected: '6', order: 0 },
      { input: '[4,2,0,3,2,5]', expected: '9', order: 1 },
      { input: '[1,0,1]', expected: '1', order: 2, isHidden: true },
      { input: '[3,0,2,0,4]', expected: '7', order: 3, isHidden: true },
    ],
    starterCode: {
      PYTHON: `def trap(height):
    # Two pointer or DP approach
    pass

import sys, json
height = json.loads(sys.stdin.read().strip())
print(trap(height))`,
      JAVASCRIPT: `function trap(height) {}
console.log(trap(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8').trim())));`,
      JAVA: `import java.util.*;
public class Solution {
    public int trap(int[] height) { return 0; }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] h = Arrays.stream(sc.nextLine().replaceAll("[\\\\[\\\\]]","").split(",")).mapToInt(Integer::parseInt).toArray();
        System.out.println(new Solution().trap(h));
    }
}`,
      CPP: `#include <bits/stdc++.h>
using namespace std;
int trap(vector<int>& h) { return 0; }
int main() {
    string s; getline(cin,s);
    vector<int> h;
    stringstream ss(s.substr(1,s.size()-2));
    string tok; while(getline(ss,tok,',')) h.push_back(stoi(tok));
    cout << trap(h) << endl;
}`,
    },
  },
]

async function main() {
  console.log('Seeding database...')

  const admin = await prisma.user.upsert({
    where: { email: 'admin@codeeval.dev' },
    update: {},
    create: { email: 'admin@codeeval.dev', name: 'Admin', passwordHash: await bcrypt.hash('admin123', 10), role: 'ADMIN' },
  })
  console.log('✓ Admin:', admin.email)

  const interviewer = await prisma.user.upsert({
    where: { email: 'interviewer@codeeval.dev' },
    update: {},
    create: { email: 'interviewer@codeeval.dev', name: 'Placement Team', passwordHash: await bcrypt.hash('placement123', 10), role: 'INTERVIEWER' },
  })
  console.log('✓ Interviewer:', interviewer.email)

  for (const p of problems) {
    const existing = await prisma.problem.findUnique({ where: { slug: p.slug } })
    if (existing) {
      console.log(`  skip: ${p.title} (already exists)`)
      continue
    }

    await prisma.problem.create({
      data: {
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
        timeLimit: p.timeLimit,
        memoryLimit: 256,
        isPublic: true,
        description: p.description,
        testCases: {
          create: p.testCases.map(tc => ({ ...tc }))
        },
        starterCode: {
          create: Object.entries(p.starterCode).map(([lang, code]) => ({ language: lang, code }))
        },
      },
    })
    console.log(`✓ Problem: ${p.title}`)
  }

  console.log('\n✅ Seeding complete!')
  console.log('\nCredentials:')
  console.log('  Admin:       admin@codeeval.dev / admin123')
  console.log('  Interviewer: interviewer@codeeval.dev / placement123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
