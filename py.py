vertices = []
faces = []
vertices1 = []
faces1 = []

with open('./OpenGL pipeline based/f1car.obj', encoding = 'utf-8') as f:
    for line in f:
        #print(line)
        #print(line[0])
        if line[0] == 'v':
            line = line.replace('\n', '')
            splitted = line.split(' ')
            #print(splitted)
            splitted.pop(0)

            vertices.append(splitted)
        elif line[0] == 'f':
            line = line.replace('\n', '')
            splitted = line.split(' ')
            #print(splitted)
            splitted.pop(0)


            faces.append(splitted)

with open('./OpenGL pipeline based/f2car.obj', encoding = 'utf-8') as f:
    for line in f:
        #print(line)
        #print(line[0])
        if line[0] == 'v':
            line = line.replace('\n', '')
            splitted = line.split(' ')
            #print(splitted)
            splitted.pop(0)

            vertices1.append(splitted)
        elif line[0] == 'f':
            line = line.replace('\n', '')
            splitted = line.split(' ')
            #print(splitted)
            splitted.pop(0)


            faces1.append(splitted)

# print(vertices)
# str_vertices = str(vertices)
# str_vertices = str_vertices.replace(' ', '')
str_faces = str(faces)
str_faces = str_faces.replace(' ', '')
print(str_faces)
print(faces1 == faces, vertices == vertices1)